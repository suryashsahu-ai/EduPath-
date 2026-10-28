import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../services/api.js';
import * as authService from '../services/auth.js';
import { renderApp, TEST_USER } from '../test/renderApp.jsx';

vi.mock('../services/auth.js', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

const signedOut = () => authService.getCurrentUser.mockRejectedValue(new ApiError('Not authenticated.', { status: 401 }));
const signedIn = () => authService.getCurrentUser.mockResolvedValue(TEST_USER);

beforeEach(() => {
  vi.resetAllMocks();
  signedOut();
});

describe('homepage, header and footer', () => {
  it('renders the hero, CTAs and trust text', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: /Find the Right College\.\s*Build the Right Future\./ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find My College' })).toHaveAttribute('href', '/explore-colleges');
    expect(screen.getByRole('link', { name: 'Explore Courses' })).toHaveAttribute('href', '/courses');
    expect(screen.getByText('Your journey to the right education starts here.')).toBeInTheDocument();
  });

  it('shows all primary links plus Login and Get Started', async () => {
    renderApp('/');
    const primary = await screen.findByRole('navigation', { name: 'Primary' });
    ['Home', 'Explore Colleges', 'Courses', 'Career Guidance', 'About Us'].forEach((name) => {
      expect(within(primary).getByRole('link', { name })).toBeInTheDocument();
    });
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
    expect(within(header).getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', '/register');
    expect(within(header).getByRole('link', { name: 'EduPath home' })).toHaveAttribute('href', '/');
  });

  it('opens and closes the mobile menu, and closes it after navigating', async () => {
    const user = userEvent.setup();
    renderApp('/');

    const toggle = await screen.findByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    const mobile = screen.getByRole('navigation', { name: 'Mobile' });

    await user.click(within(mobile).getByRole('link', { name: 'Courses' }));
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Courses' })).toBeInTheDocument();
  });

  it('closes the mobile menu with Escape', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(await screen.findByRole('button', { name: 'Open menu' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();
  });

  it('shows a placeholder for unbuilt sections and a 404 for unknown routes', async () => {
    const { unmount } = renderApp('/career-guidance');
    expect(await screen.findByRole('heading', { level: 1, name: 'Career Guidance' })).toBeInTheDocument();
    expect(screen.getByText(/isn.t available yet/i)).toBeInTheDocument();
    unmount();

    renderApp('/definitely-not-a-page');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('renders footer links and a copyright notice', async () => {
    renderApp('/');
    const footer = await screen.findByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'Register' })).toBeInTheDocument();
    expect(footer).toHaveTextContent(`© ${new Date().getFullYear()} EduPath`);
  });
});

describe('registration', () => {
  const fill = async (user, { name = 'Asha Verma', email = 'asha@example.com', password = 'Sup3rSecret', confirm = 'Sup3rSecret' } = {}) => {
    if (name) await user.type(screen.getByLabelText('Full name'), name);
    if (email) await user.type(screen.getByLabelText('Email address'), email);
    if (password) await user.type(screen.getByLabelText('Password', { selector: 'input' }), password);
    if (confirm) await user.type(screen.getByLabelText('Confirm password'), confirm);
  };

  it('shows required-field errors next to each field and does not call the API', async () => {
    const user = userEvent.setup();
    renderApp('/register');
    await user.click(await screen.findByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Full name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email address is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('flags a bad email, weak password and mismatched confirmation', async () => {
    const user = userEvent.setup();
    renderApp('/register');
    await screen.findByLabelText('Full name');
    await fill(user, { email: 'not-an-email', password: 'weak', confirm: 'different' });
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters with upper case/i)).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('gives live password strength feedback', async () => {
    const user = userEvent.setup();
    renderApp('/register');
    const password = await screen.findByLabelText('Password', { selector: 'input' });
    await user.type(password, 'abc');
    expect(screen.getByText('Password strength: Weak')).toBeInTheDocument();
    await user.clear(password);
    await user.type(password, 'Abcdefghij1!');
    expect(screen.getByText('Password strength: Strong')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderApp('/register');
    const password = await screen.findByLabelText('Password', { selector: 'input' });
    expect(password).toHaveAttribute('type', 'password');
    const [toggle] = screen.getAllByRole('button', { name: 'Show password' });
    await user.click(toggle);
    expect(password).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('registers, then lands on the login page with a confirmation and the email filled in', async () => {
    const user = userEvent.setup();
    authService.register.mockResolvedValue({ message: 'ok' });
    renderApp('/register');
    await screen.findByLabelText('Full name');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(authService.register).toHaveBeenCalledWith({
      fullName: 'Asha Verma',
      email: 'asha@example.com',
      password: 'Sup3rSecret',
    });
    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    expect(screen.getByText(/account has been created/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toHaveValue('asha@example.com');
  });

  it('shows a duplicate-email error on the email field', async () => {
    const user = userEvent.setup();
    authService.register.mockRejectedValue(
      new ApiError('An account with this email already exists.', { status: 409 }),
    );
    renderApp('/register');
    await screen.findByLabelText('Full name');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true');
  });

  it('maps server-side validation errors to fields and shows server failures gracefully', async () => {
    const user = userEvent.setup();
    authService.register.mockRejectedValueOnce(
      new ApiError('Please correct the highlighted fields.', { status: 422, fieldErrors: { full_name: 'Too short from server' } }),
    );
    renderApp('/register');
    await screen.findByLabelText('Full name');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(await screen.findByText('Too short from server')).toBeInTheDocument();

    authService.register.mockRejectedValueOnce(new ApiError('The server ran into a problem. Please try again in a moment.', { status: 500 }));
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/server ran into a problem/i);
  });

  it('shows a loading state and ignores repeated submits while the request is in flight', async () => {
    const user = userEvent.setup();
    let resolve;
    authService.register.mockReturnValue(new Promise((r) => { resolve = r; }));
    renderApp('/register');
    await screen.findByLabelText('Full name');
    await fill(user);

    const submit = screen.getByRole('button', { name: 'Create Account' });
    await user.click(submit);
    const busy = await screen.findByRole('button', { name: /Creating account/ });
    expect(busy).toBeDisabled();
    await user.click(busy);
    await user.keyboard('{Enter}');
    expect(authService.register).toHaveBeenCalledTimes(1);

    resolve({ message: 'ok' });
    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  });
});

describe('login and protected dashboard', () => {
  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.click(await screen.findByRole('button', { name: 'Sign In' }));
    expect(screen.getByText('Email address is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('shows a clear error for invalid credentials', async () => {
    const user = userEvent.setup();
    authService.login.mockRejectedValue(new ApiError('Invalid email or password.', { status: 401 }));
    renderApp('/login');
    await user.type(await screen.findByLabelText('Email address'), 'asha@example.com');
    await user.type(screen.getByLabelText('Password', { selector: 'input' }), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
  });

  it('reports network failures without crashing', async () => {
    const user = userEvent.setup();
    authService.login.mockRejectedValue(new ApiError('Unable to reach the server. Check your connection and try again.'));
    renderApp('/login');
    await user.type(await screen.findByLabelText('Email address'), 'asha@example.com');
    await user.type(screen.getByLabelText('Password', { selector: 'input' }), 'Sup3rSecret');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to reach the server/i);
  });

  it('signs in and lands on the dashboard, then logs out', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue(TEST_USER);
    authService.logout.mockResolvedValue();
    renderApp('/login');
    await user.type(await screen.findByLabelText('Email address'), 'asha@example.com');
    await user.type(screen.getByLabelText('Password', { selector: 'input' }), 'Sup3rSecret');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByRole('heading', { name: 'Welcome, Asha' })).toBeInTheDocument();
    expect(screen.getByText(/signed in as asha@example.com/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Log out/ }));
    await waitFor(() => expect(authService.logout).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('heading', { level: 1, name: /Find the Right College/ })).toBeInTheDocument();
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Login' })).toBeInTheDocument();
  });

  it('redirects signed-out visitors from /dashboard to /login', async () => {
    renderApp('/dashboard');
    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Welcome, / })).not.toBeInTheDocument();
  });

  it('restores an existing session on load and keeps signed-in users off the login page', async () => {
    signedIn();
    renderApp('/login');
    expect(await screen.findByRole('heading', { name: 'Welcome, Asha' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Dashboard' }).length).toBeGreaterThan(0);
  });
});
