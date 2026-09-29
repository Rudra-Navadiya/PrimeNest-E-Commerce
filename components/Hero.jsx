export default function Hero() {
  return (
    <section className="premium-hero">

      <div className="hero-image"></div>

      <div className="hero-content-premium">

        <p className="hero-label">
          PRIME NEST / COLLECTION 01
        </p>

        <h1>
          Everyday,
          <br />
          <em>Elevated.</em>
        </h1>

        <p className="hero-text">
          Thoughtfully designed essentials for those
          who appreciate simplicity, quality and style.
        </p>

        <div className="hero-actions">
          <a href="/shop" className="premium-primary-button">
            Explore Collection
            <span>↗</span>
          </a>

          <a href="/shop" className="premium-text-button">
            Discover PrimeNest
          </a>
        </div>

      </div>

      <div className="hero-bottom">

        <span>NEW SEASON</span>

        <div className="hero-line"></div>

        <span>SCROLL TO EXPLORE ↓</span>

      </div>

    </section>
  );
}