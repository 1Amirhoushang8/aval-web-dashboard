import './Linechart.scss'

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function LineChart() {
    const data = {
        labels: ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند', 'فروردین'],
        datasets: [
            {
                label: 'درامد',
                data: [24575, 2467, 67530, 20000, 13958, 524, 418347],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'نمودار درامد',
            },
        },
    };

    return <Line data={data} options={options} />;
}
