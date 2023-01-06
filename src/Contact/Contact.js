/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { googleMap } from '../Core/config';
import { FormattedMessage } from 'react-intl';

class ContactPage extends React.Component {
  render() {
    return (
      <div className="portlet mt-element-ribbon light portlet-fit bordered">
        <div className="portlet-title">
          <div className="caption">
            <h2 className="caption-subject bold uppercase">
              <FormattedMessage id="app.footer.link.contactus" />
            </h2>
          </div>
        </div>
        <div className="portlet-body">
          <div className="c-content-contact-1 c-opt-1">
            <div className="row" data-auto-height=".c-height">
              <div className="col-lg-8 col-md-6 c-desktop" />
              <div className="col-lg-4 col-md-6">
                <div className="c-body">
                  <div className="c-section">
                    <h3 className="bitmoon">Bitmoon</h3>
                  </div>
                  <div className="c-section">
                    <div className="c-content-label uppercase bg-primary">
                      <FormattedMessage id="v2.app.footer.link.contact.address" />
                    </div>
                    <p>
                      Center Tower,
                      <br />28 queen's read central,
                      <br />Hong Kong
                    </p>
                  </div>
                  <div className="c-section">
                    <div className="c-content-label uppercase bg-primary">
                      <FormattedMessage id="v2.app.footer.link.contact.contactinfo" />
                    </div>
                    <p>
                      <strong>E</strong>&nbsp;
                      <a href="mailto:support@bitmoon.net">
                        support@bitmoon.net
                      </a>
                    </p>
                  </div>
                  <div className="c-section">
                    <div className="c-content-label uppercase bg-primary">
                      <FormattedMessage id="v2.app.footer.link.contact.social" />
                    </div>
                    <br />
                    <ul className="c-content-iconlist-1 ">
                      <li>
                        <a href="/">
                          <i className="fa fa-twitter" />
                        </a>
                      </li>
                      <li>
                        <a href="/">
                          <i className="fa fa-facebook" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="gmapbg"
              className="c-content-contact-1-gmap"
              style={{ height: '600px', paddingBottom: '20px' }}
            >
              <iframe
                src={`//www.google.com/maps/embed/v1/place?key=${
                  googleMap.embedMap
                }&q=Whampoa Station, Hung Hom, Hong Kong`}
                width="100%"
                height="600"
                frameBorder="0"
                style={{ border: 0 }}
                title="Contact us"
              />
            </div>
            <div className="clearfix" />
          </div>
        </div>
      </div>
    );
  }
}

export default ContactPage;
