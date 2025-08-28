import React, { PureComponent } from 'react'
import { Select } from 'antd';
class DashboardFilter extends PureComponent {
    handleChange = (value) => {
        this.props.loadDonutGraphData(value)
    }
    render() {
        const { Option } = Select;
        const { t } = this.props
        return (
            <Select defaultValue="week" className="ml-auto" style={{ width: 120 }} onChange={this.handleChange}>
                <Option value="week"> {t('dashboard.week')}</Option>
                <Option value="month"> {t('dashboard.month')}</Option>
                <Option value="year"> {t('dashboard.year')}</Option>
            </Select>
        );
    }
}
export default DashboardFilter