import React from 'react'
import Recharts from 'recharts'
const {ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} = Recharts;
 

class LineBarAreaComposedChart extends React.Component {
  constructor(props) {
    super(props);
  }
	render () {
  	return (
      (this.props.data instanceof Array && this.props.data.length > 0) ?
      <ResponsiveContainer width='100%' height={499}>
    	<ComposedChart data={this.props.data.slice(-10)}
            margin={{top: 20, right: 20, bottom: 20, left: 20}}>
          <XAxis dataKey=' '/>
          <YAxis />
          <Tooltip/>
          <Legend/>
          <CartesianGrid stroke='#f5f5f5'/>
          <Area type='monotone' dataKey='duration_in_sec' fill='#8884d8' stroke='#8884d8'/>
          <Bar dataKey='wpm' barSize={20} fill='#413ea0'/>
          <Line type='monotone' dataKey='score' stroke='#ff7300'/>
       </ComposedChart>
       </ResponsiveContainer> : ''
    );
  }
}

export default LineBarAreaComposedChart
