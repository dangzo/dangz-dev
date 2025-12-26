const Logo = () => {
  return (
    <div className="border border-blue-700">
      <a href="/">Dangz.dev</a>
    </div>
  );
}

const Navigation = () => {
  return (
    <nav className="border border-red-700">
      <ul className="flex flex-row gap-4">
        <li><a href="/">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  );
}

const ActionBtns = () => {
  return (
    <div className="border border-green-700">
      <button>Login</button>
      <button>Sign Up</button>
    </div>
  );
}

export const Header = () => {
  return (
    <header className="border border-e-red-400 flex items-center bg-transparent backdrop-blur-sm justify-between py-8">
      <Logo />
      <div className="flex flex-row items-center gap-6">
        <Navigation />
        <ActionBtns />
      </div>
    </header>
  );
}
