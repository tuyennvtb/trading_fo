/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Link from '../Link';
import { getSliderById } from '../Redux/actions/news';
import { Cookies } from 'react-cookie';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { GLOBAL_VARIABLES, SCREEN_MOBILE, SCREEN_TABLET } from '../Helpers/constants/system';
import Slider from 'react-slick';
import './style/slick-carousel/slick.css';
import './style/slick-carousel/slick-theme.css';

function CustomNextArrow(props) {
  const { className, style, onClick } = props;
  return <div className={className} style={style} onClick={onClick} />;
}

function CustomPrevArrow(props) {
  const { className, style, onClick } = props;
  return <div className={className} style={style} onClick={onClick} />;
}
class Sliders extends React.Component {
  async componentDidMount() {
    const { actions } = this.props;
    await actions.getSliderById(2);
  }

  _parseSlider = sliderContent => {
    let result = null;
    try {
      result = JSON.parse(sliderContent);
    } catch (err) { }
    return result;
  };
  render() {
    const { sliderContent } = this.props;
    if (!sliderContent) return null;
    const JSONContent = this._parseSlider(sliderContent);
    if (!JSONContent)
      return (
        <div className="page-container">
          <div className="flash-screen hide-opacity">
            <div className="moon">
              I see a bad moon rising I see trouble on the way
            </div>
            <div className="flash-message text-center">
              <h1>
                <FormattedMessage id="app.home.ucoin.banner.header" />
              </h1>
              <div className="countdown-calendar">
                <h3>
                  <FormattedMessage id="app.home.bitmoon.banner.benefit" />
                </h3>
                <Link href="/register" className="md-btn btn">
                  <FormattedMessage id="app.global.button.joinus" />
                </Link>
              </div>
            </div>
            <div className="stars" />
            <div className="twinkling" />
            <div className="clouds" />
          </div>
          <Link href="/" className="page-quick-sidebar-toggler">
            <i className="icon-login" />
          </Link>
        </div>
      );
    const settings = {
      customPaging: function (i) {
        return (
          <a key={i + i + 1}>
            <img alt="" className="lazy" src={JSONContent[i].photo_thumbnail || JSONContent[i].photo} />
          </a>
        );
      },
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      dots: true,
      dotsClass: 'slick-dots slick-thumb',
      infinite: true,
      swipeToSlide: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            infinite: true,
            dots: true,
          },
        },
        {
          breakpoint: 768,
          settings: {
            dots: false,
          },
        },
        {
          breakpoint: 480,
          settings: {
            dots: false,
          },
        },
      ],
    };
    return (
      <div className="homepage-slider">
        <Slider {...settings}>
          {JSONContent.map(item => {
            let photo = '';
            if (SCREEN_MOBILE()) {
              photo = item.photo_mobile;
            } else if (SCREEN_TABLET()) {
              photo = item.photo_tablet;
            }

            if (!photo) {
              photo = item.photo;
            }
            return (
              <div key={item.id}>
                <a
                  className="main-image"
                  href={item.newsUrl}
                  target="_blank"
                  style={{
                    backgroundImage: `url(${photo})`,
                  }}
                >
                  <h1>{item.description}</h1>
                </a>
              </div>
            );
          })}
        </Slider>
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ news }) {
  const sliderContent = (news && news.sliderContent) || null;
  return {
    sliderContent: sliderContent,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getSliderById }, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Sliders);
