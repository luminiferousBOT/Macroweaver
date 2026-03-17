export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <p className="footer__text">
            © 2026 Macroweaver — AI Economic Policy Advisor made by{' '}
            <a
              href="https://www.instagram.com/nothisisdk/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link footer__link--highlight"
            >
              nothisisdk
            </a>{' '}
            with{' '}
            <a
              href="https://www.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link footer__link--highlight"
            >
              Opus 4.6
            </a>
          </p>
          <div className="footer__links">
            <a
              href="https://github.com/luminiferousBOT"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/devashish-kaushik-31a862271"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
