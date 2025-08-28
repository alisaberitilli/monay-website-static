import React, { PureComponent } from 'react'
import ReactApexChart from 'react-apexcharts'
import ApiEndPoints from '../../utilities/apiEndPoints'
import logger from '../../utilities/logger'
import APIrequest from '../../services'
import {
    currentDate
} from '../../utilities/common'

class ApexDashedGraph extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {

            series: [{
                name: "Sent Money",
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

            },
            {
                name: "Received Money",
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

            },
            {
                name: 'WithDraw Money',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

            }
            ],
            options: {
                chart: {
                    width: "100%",
                    height:400,
                    type: 'bar',
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: true,
                        offsetX: 0,
                        offsetY: 0,
                        tools: {
                            download: true,
                            selection: true,
                            zoom: true,
                            zoomin: true,
                            zoomout: true,
                            pan: true,
                            reset: true | '<img src="/static/icons/reset.png" width="20">',
                            customIcons: []
                        },
                        export: {
                            csv: {
                                filename: `Monay_Statistics_${currentDate()}`,
                                columnDelimiter: ',',
                                headerCategory: 'Months',
                                headerValue: 'value',
                                dateFormatter(timestamp) {
                                    return new Date(timestamp).toDateString()
                                }
                            }
                        },
                        autoSelected: 'zoom'
                    },

                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: [5, 7, 5],
                    curve: 'straight',
                    dashArray: [0, 8, 5]
                },
                title: {
                    text: 'Statistics',
                    align: 'left',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        fontFamily: 'TitilliumWeb-SemiBold',
                        color: 'rgba(0, 0, 0, 0.85)'
                    },
                },
                legend: {
                    tooltipHoverFormatter: function (val, opts) {
                        return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + ''
                    }
                },
                markers: {
                    size: 0,
                    hover: {
                        sizeOffset: 6
                    }
                },
                xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep',
                        'Oct', 'Nov', 'Dec'
                    ],
                },
                tooltip: {
                    y: [
                        {
                            title: {
                                formatter: function (val) {
                                    return val
                                }
                            }
                        },
                        {
                            title: {
                                formatter: function (val) {
                                    return val
                                }
                            }
                        },
                        {
                            title: {
                                formatter: function (val) {
                                    return val;
                                }
                            }
                        }
                    ]
                },
                grid: {
                    borderColor: '#f1f1f1',
                }
            },


        };
    }
    componentDidMount() {
        this.loadDonutGraphData()
    }

    loadDonutGraphData = async () => {
        try {

            const payload = {
                ...ApiEndPoints.dashboardLineGraph,

            }
            const res = await APIrequest(payload)
            this.setState({
                series: res.data
            })
        } catch (error) {
            logger({ 'error:': error })
        }
    };

    render() {
        return (

            <div id="line-chart">
                <ReactApexChart options={this.state.options} series={this.state.series} type="line" height={400}/>
            </div>


        );
    }
}
export default ApexDashedGraph