import React from 'react';
import { render } from '@testing-library/react';
import Loading from '../components/Loading';

describe('Loading component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Loading />);
    expect(container.firstChild).not.toBeNull();
  });

  it('contains a spinning element', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).not.toBeNull();
  });
});
