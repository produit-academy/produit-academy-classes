export default function StatCard({ label, value, sublabel, color = 'var(--accent-green)' }) {
    return (
        <div className="stat-card glass-card">
            <div className="stat-card-accent" style={{ background: color }} />
            <div className="stat-card-body">
                <span className="stat-card-value" style={{ color }}>{value}</span>
                <span className="stat-card-label">{label}</span>
                {sublabel && <span className="stat-card-sublabel">{sublabel}</span>}
            </div>
        </div>
    );
}
