import { getMedicineBadge, getVibrantColor } from '@/utils/placeholderUtils';

export default function ProductCard({ product }) {
    const badgeText = getMedicineBadge(product.title);
    const badgeColor = getVibrantColor(product._id || product.title);

    return (
        <div className="glass-morphism fade-in" style={{
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'transform 0.2s ease',
        }}>
            <div style={{
                height: '150px',
                backgroundColor: badgeColor,
                borderRadius: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                fontSize: '2.5rem',
                fontWeight: 800,
                letterSpacing: '1px'
            }}>
                {badgeText}
            </div>
            <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {product.category}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{product.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', height: '3rem', overflow: 'hidden' }}>
                    {product.description}
                </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--foreground)' }}>
                    ${product.price}
                </span>
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
