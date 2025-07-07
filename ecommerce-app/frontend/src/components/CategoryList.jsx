import React from 'react';

const categories = [
  { name: 'Vegetables', image: '/assets/cat-vegetable.jpg' },
  { name: 'Exotics', image: '/assets/cat-exotic.jpg' },
];

const CategoryList = () => {
  return (
    <div className="container">
      <h2 className="category-heading">Shop by Category</h2>
      <div className="category-grid">
        {categories.map((cat, i) => (
          <div key={i} className="category-card">
            <img src={cat.image} alt={cat.name} className="category-image" />
            <h3 className="category-title">{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
