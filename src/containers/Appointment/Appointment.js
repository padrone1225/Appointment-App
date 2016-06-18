'use strict';
import React, { Component, PropTypes } from 'react';
import { ScrollView,AlertIOS,View,Text } from 'react-native';
import { connect } from 'react-redux';
import { fetchTimings } from './../../actions/timings';
import { createAppointment, invalidateCreatedAppointment } from './../../actions/appointments';
import Calendar from './../../components/Appointment/Calendar';
import TimingList from './../../components/Appointment/TimingList';
import AppointmentList from './../../components/Appointment/AppointmentList';
import AppointmentConfirm from './../../components/Appointment/AppointmentConfirm';
import EmployeePicker from './../../components/Company/EmployeePicker';
import { Actions } from 'react-native-router-flux';
import FormButton from './../../components/FormButton';

class Appointment extends Component {

  static propTypes = {
    serviceID:PropTypes.number.isRequired,
    companyID: PropTypes.number.isRequired,
    timingsReducer : PropTypes.object.isRequired,
    userReducer:PropTypes.object.isRequired,
    employees: PropTypes.array.isRequired,
    timings : PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state={
      selectedDate: new Date(),
      selectedTime: {},
      selectedEmployee: {},
      showEmployeeListModal : false,
      showAppointmentConfirmModal : false
    };
    
    this.listEmployees = this.listEmployees.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onTimeSelect = this.onTimeSelect.bind(this);
    this.onEmployeeSelect = this.onEmployeeSelect.bind(this);
    this.onEmployeeListModalClosed = this.onEmployeeListModalClosed.bind(this);
    this.onAppointmentConfirmModalListClosed = this.onAppointmentConfirmModalListClosed.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.inValidateAppointment = this.inValidateAppointment.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  componentDidMount() {

    this.props.dispatch(fetchTimings());

    if(this.props.userReducer.isAuthenticated) {
      this.props.dispatch(invalidateCreatedAppointment());
    }
  }

  listEmployees() {
    this.setState({ showEmployeeListModal:true });
  }

  onDateChange(date) {
    this.setState({ selectedDate: date });
  }

  onTimeSelect(time) {
    this.setState({ selectedTime: time });
  };

  onEmployeeSelect(employee){
    this.setState({
      selectedEmployee:employee,
      showEmployeeListModal:false
    });
  }

  onEmployeeListModalClosed() {
    this.setState({ showEmployeeListModal:false });
  }

  onAppointmentConfirmModalListClosed() {
    this.setState({ showAppointmentConfirmModal:false });
  }

  handleNext() {
    this.setState({ showAppointmentConfirmModal:true });
  }

  inValidateAppointment() {
    this.props.dispatch(invalidateCreatedAppointment());
    return Actions.pop();
  }

  handleConfirm() {
    this.props.dispatch(createAppointment(this.props.companyID,this.props.serviceID,this.state.selectedDate,this.state.selectedTime,this.state.selectedEmployee))
      .then(()=>console.log('success'))
      .catch(()=>console.log('error'));
  }


  render() {

    console.log('renderd Appointment');
    const {timings,employees,company,userReducer,service,timingsReducer} = this.props;
    return (
      <ScrollView
        style={{ flex:1, backgroundColor:'white' }}
        contentContainerStyle={{paddingVertical:64}}
        ref="scrollView"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
      >
        <Calendar
          selectedDate={this.state.selectedDate}
          onDateChange={this.onDateChange}
        />

        <AppointmentList
          service={service}
          selectedEmployee={this.state.selectedEmployee}
          listEmployees={this.listEmployees}
        />

        <TimingList
          timings={timings}
          selectedTime={this.state.selectedTime}
          onTimeSelect={this.onTimeSelect}
          timingsReducer={timingsReducer}
        />

        {
          employees &&
          <EmployeePicker
            employees={employees}
            onEmployeeSelect={this.onEmployeeSelect}
            onClosed={this.onEmployeeListModalClosed}
            showEmployeeListModal={this.state.showEmployeeListModal}
          />
        }
        <AppointmentConfirm
          company={company}
          service={service}
          userReducer={userReducer}
          selectedEmployee={this.state.selectedEmployee}
          selectedTime={this.state.selectedTime}
          selectedDate={this.state.selectedDate}
          showAppointmentConfirmModal={this.state.showAppointmentConfirmModal}
          onClosed={this.onAppointmentConfirmModalListClosed}
          onAppointmentConfirm={this.handleConfirm}
          inValidateAppointment={this.inValidateAppointment}
        />

        {!this.state.showAppointmentConfirmModal  &&
        <FormButton
          onPress={this.handleNext}
          buttonText='Next'
          containerStyle={{padding:5,margin:10,marginTop:0,marginBottom:0,backgroundColor:'tomato',opacity:0.7}}
        />
        }
      </ScrollView>
    );
  }
}

function mapStateToProps(state,ownProps) {
  const { entities } = state;
  const company = entities.companies[ownProps.companyID];
  const service = entities.services[ownProps.serviceID];
  return {
    timingsReducer:state.timingsReducer,
    userReducer:state.userReducer,
    company,
    service,
    employees:company.employees ? company.employees.map((employeeID)=>entities.employees[employeeID]) : [],
    timings:entities.timings
  }
}

export default connect(mapStateToProps)(Appointment)
