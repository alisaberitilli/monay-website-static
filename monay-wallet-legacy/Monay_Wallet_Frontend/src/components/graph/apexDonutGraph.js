import React, { PureComponent } from 'react'
import ReactApexChart from 'react-apexcharts'
import ApiEndPoints from '../../utilities/apiEndPoints'
import logger from '../../utilities/logger'
import APIrequest from '../../services'
import DahsboardFilter from './dashboardFilter'

class ApexDonutGraph extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            series: [0, 0],
            options: {
                chart: {
                    type: 'donut',
                },
                labels: ['Success', 'Failed'],
                colors: ['#54D55E', '#F24C59'],
                legend: {
                    position: 'bottom'
                },
                breakpoint: 480,

            },


        };
    }
    componentDidMount() {
        this.loadDonutGraphData('week')
    }

    handleChange = (value) => {
        this.loadDonutGraphData(value)
    }

    loadDonutGraphData = async (val = 'week') => {
        try {
            let queryParams = {
                type: val
            }
            const payload = {
                ...ApiEndPoints.dashboardDonutGraph,
                queryParams
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
        const { t } = this.props
        return (
            <div className="card graphCard border-0 bg-white ">
                <div className="card-header border-0 bg-white d-flex">
                    <h4 className="graphCard__title font-sm mb-0">{t('dashboard.transactionStatistics')}</h4>
                    <DahsboardFilter t={t} loadDonutGraphData={this.loadDonutGraphData} />
                </div>
                <div className="card-body">
                    <div>
                        <div id="donut-chart">
                            <ReactApexChart options={this.state.options} series={this.state.series} type="donut" />
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}
export default ApexDonutGraph