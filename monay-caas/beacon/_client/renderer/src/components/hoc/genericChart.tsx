import React from 'react';
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Line } from 'react-chartjs-2';
import  'chart.js/auto';
import { Container } from '../atoms';


defaults.maintainAspectRatio = false;
defaults.responsive = true;

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 22;
defaults.plugins.title.color = "#36597D";

interface ChartProps {
    chartData: any;
    width: number;
    label: string;
};

const Chart: React.FC<ChartProps> = ({
    chartData,
    width,
    label,
    ...props
}) => {

    const data = {
        labels: chartData.map((data)=> data.day),
        datasets: [
            {
                label: '',
                data: chartData.map((data)=> data.payment),
                fill: false,
                backgroundColor: "rgba(123, 97, 255, 0.80)",
                borderColor: "rgba(123, 97, 255, 0.80)",
                borderWidth: 4,
            },
        ]
    }

    const options = {
        scales: {
            y: {
                ticks: {
                    callback: function(value, index, ticks) {
                        return '$' + value + ".00";
                    }
                },
                border: {
                    display: false
                },
                grid: {
                    color: '#FFFFFF'
                },
            },
            x: {
                border: {
                    display: false
                },
                grid: {
                    color: "#F1F5F9"
                }
            }
        },
        elements: {
            line: {
                tension: 0.5,
            },
        },
        plugins: {
            title: {
                text: label
            }
        }
    }

    return (
        <Container className={`w-[${width}px] h-[500px]`}>
            <Line 
                data={data}
                options={options}
            />
        </Container>
    )
};

export default Chart;

