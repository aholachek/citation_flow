/*eslint-env node, mocha */
/*global expect */
/*eslint no-console: 0*/
'use strict';

// Uncomment the following lines to use the react test utilities
// import TestUtils from 'react-addons-test-utils';
import createComponent from 'helpers/shallowRenderHelper';

import SankeyD3Component from 'components//SankeyD3Component.js';

describe('SankeyD3Component', () => {
    let component;

    beforeEach(() => {
      component = createComponent(SankeyD3Component);
    });

    it('should have its component name as default className', () => {
      expect(component.props.className).to.equal('sankeyd3-component');
    });
});
