import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AttendanceChart({ present = 0, absent = 0, late = 0 }) {
    const total = present + absent + late;
    const percentage = total > 0 ? Math.round((present + late) / total * 100) : 100;

    const data = {
        labels: ['Present', 'Absent', 'Late'],
        datasets: [
            {
                data: [present, absent, late],
                backgroundColor: [
                    'rgba(51, 174, 120, 0.85)',
                    'rgba(231, 76, 60, 0.85)',
                    'rgba(241, 196, 15, 0.85)',
                ],
                borderColor: [
                    'rgba(51, 174, 120, 1)',
                    'rgba(231, 76, 60, 1)',
                    'rgba(241, 196, 15, 1)',
                ],
                borderWidth: 2,
                hoverOffset: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 10,
                    font: { size: 13, family: 'inherit' },
                    color: '#555',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(255,255,255,0.95)',
                titleColor: '#212121',
                bodyColor: '#555',
                borderColor: '#e0e0e0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            },
        },
    };

    return (
        <div className="attendance-chart-wrapper glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                Attendance Overview
            </h3>
            <div style={{ position: 'relative', height: '220px' }}>
                <Doughnut data={data} options={options} />
                <div className="chart-center-label">
                    <span className="chart-percentage">{percentage}%</span>
                    <span className="chart-percentage-label">Attendance</span>
                </div>
            </div>
        </div>
    );
}
