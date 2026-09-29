const categories = [
  {
    name: "Men",
    subtitle: "Modern essentials",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Women",
    subtitle: "Effortless elegance",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Accessories",
    subtitle: "The finishing touch",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Home",
    subtitle: "Designed to live with",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Perfume",
    subtitle: "Leave an impression",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="category-showcase">

      <div className="category-heading">
        <div>
          <p className="category-label">
            CURATED FOR YOU
          </p>

          <h2>
            Explore
            <em> Collections</em>
          </h2>
        </div>

        <p className="category-description">
          Discover carefully selected pieces across fashion,
          accessories, fragrance and modern living.
        </p>
      </div>

      <div className="category-grid">

        {categories.map((category, index) => (
          <a
            href={`/shop?category=${category.name.toLowerCase()}`}
            className={`category-card category-card-${index + 1}`}
            key={category.name}
          >
            <div
              className="category-image"
              style={{
                backgroundImage: `url(${category.image})`,
              }}
            />

            <div className="category-overlay" />

            <div className="category-content">
              <p>{category.subtitle}</p>

              <h3>{category.name}</h3>

              <span>
                Explore <b>↗</b>
              </span>
            </div>
          </a>
        ))}

      </div>

    </section>
  );
}