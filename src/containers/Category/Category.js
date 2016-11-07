'use strict';
import React, { Component, PropTypes } from 'react';
import { Image, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchCategory } from './../../actions/Category/category';
import { favoriteCompany } from './../../actions/favorites';
import { assets } from './../../utils/assets';
import CompanyList from './../../components/Company/CompanyList';
import LoadingIndicator from './../../components/LoadingIndicator';
import { Actions } from 'react-native-router-flux';

class Category extends Component {

  constructor() {
    super();
    this.favoriteCompany = this.favoriteCompany.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(fetchCategory(this.props.itemID,['companies']));
  }

  loadCompany(company) {
    return Actions.companyEntity({
      title:company.name_en,
      itemID: company.id
    });
  }

  favoriteCompany(company) {
    this.props.dispatch(favoriteCompany(company));
  }

  render() {

    const {categoryReducer,companies} = this.props;

    return (
      <Image source={assets.bg} style={{flex: 1,width: null,height: null,paddingTop:64,backgroundColor:'white'}}>
        { categoryReducer.isFetching && <LoadingIndicator /> }
        <CompanyList
          loadCompany={this.loadCompany}
          favoriteCompany={this.favoriteCompany}
          companies={companies}
        />
      </Image>
    );
  }
}

Category.propTypes = {
  itemID:PropTypes.number.isRequired,
  userReducer:PropTypes.object.isRequired
};

const getCategory = (state,props) => state.entities.categories[props.itemID];
const getEntities = (state,props) => state.entities;

const getCompanies = createSelector(
  [ getCategory,getEntities ],
  ( category,entities ) => {
    // return category.companies ? alphabetize(category.companies.map((company) => entities.companies[company])) : []
    return category.companies ? category.companies.map((company) => entities.companies[company]) : []
  }
);

function mapStateToProps(state,ownProps) {
  return {
    categoryReducer:state.categoryReducer,
    userReducer:state.userReducer,
    companies:getCompanies(state,ownProps)
  }
}

export default connect(mapStateToProps)(Category);
