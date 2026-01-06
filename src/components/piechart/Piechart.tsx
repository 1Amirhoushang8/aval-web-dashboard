import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './Piechart.scss';

export default function PieChart() {
    const data = {
        labels: ['انجام شده', 'لغو شده', 'درحال انجام'],
        datasets: [
            {
                label: 'My Dataset',
                data: [300, 50, 100],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                ],
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div className="pie-container">
            <Pie data={data} options={options} />
        </div>
    );
}
