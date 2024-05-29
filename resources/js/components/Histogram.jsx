import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Container, Typography } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import { useTheme } from '@emotion/react';

Chart.register(...registerables);

const Histogram = ({ data }) => {
    const labels = Object.keys(data);
    const values = Object.values(data);

    const theme = useTheme();

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Votes',
                data: values,
                backgroundColor: theme.palette.primary.main,
                borderWidth: 1,
                maxBarThickness: 40,
                borderRadius: 5,
            },
        ],
    };

    const maxValue = Math.max(...values);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                min: 0,
                max: maxValue + 1,
                ticks: {
                    stepSize: 1,
                    color: theme.customComponents.histogram.label
                },
                grid: {
                    display: true,
                    color: theme.customComponents.histogram.grid
                }
            },
            x: {
                ticks: {
                    stepSize: 1,
                    color: theme.customComponents.histogram.label
                },
                grid: {
                    display: true,
                    color: theme.customComponents.histogram.grid
                }
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Votes: ${context.raw}`;
                    },
                },
            },
        },
    };

    return (
        <Container
            sx={{ mb: 3 }}
        >
            <div style={{ height: '250px' }}>
                <Bar data={chartData} options={options} />
            </div>
        </Container>
    );
};

export default Histogram;
