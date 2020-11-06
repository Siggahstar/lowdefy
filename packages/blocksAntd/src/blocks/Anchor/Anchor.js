/*
  Copyright 2020 Lowdefy, Inc

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import React from 'react';
import { get, type } from '@lowdefy/helpers';
import Icon from '../Icon/Icon';
import { blockDefaultProps } from '@lowdefy/block-tools';

const AnchorContent = ({ icon, methods, strong, title }) => {
  if (strong) {
    return (
      <b>
        {icon && <Icon properties={icon} methods={methods} />}
        {` ${title}`}
      </b>
    );
  }
  return (
    <>
      {icon && <Icon properties={icon} methods={methods} />}
      {` ${title}`}
    </>
  );
};

const AnchorBlock = ({ actions, blockId, loading, methods, properties }) => {
  if (properties.disabled || get(actions, 'onClick.loading') || loading) {
    return (
      <span className={methods.makeCssClass(properties.style)}>
        <AnchorContent
          icon={
            get(actions, 'onClick.loading') || loading
              ? { name: 'LoadingOutlined', spin: true }
              : properties.icon
          }
          methods={methods}
          strong={properties.strong}
          title={type.isNone(properties.title) ? blockId : properties.title}
        />
      </span>
    );
  }
  return (
    <a
      className={methods.makeCssClass(properties.style)}
      onClick={() => methods.callAction({ action: 'onClick' })}
    >
      <AnchorContent
        icon={properties.icon}
        methods={methods}
        strong={properties.strong}
        title={type.isNone(properties.title) ? blockId : properties.title}
      />
    </a>
  );
};

AnchorBlock.defaultProps = blockDefaultProps;

export default AnchorBlock;
