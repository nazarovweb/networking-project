import userReducer, {
  setDefaultAccount,
  setAddress,
  addAddress,
  removeAddress,
  addCoupon,
  removeCoupon,
  addGiftCard,
  removeGiftCard,
} from '../features/UIUpdates/UserAccount';

const initialState = {
  defaultAccount: { userID: 0, userName: '', email: '', mobile_number: 0, dob: '' },
  addresses: [],
  giftCards: [],
  coupons: [],
  paymentCards: [],
  notifications: [],
  preferences: [],
};

describe('userSlice', () => {
  it('returns the initial state', () => {
    expect(userReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('setDefaultAccount updates account info', () => {
    const account = { userID: 42, userName: 'Ali', email: 'ali@test.com', mobile_number: 9876543210, dob: '2000-01-01' };
    const state = userReducer(undefined, setDefaultAccount(account));
    expect(state.defaultAccount).toEqual(account);
  });

  it('setAddress replaces the address list', () => {
    const addresses = [
      { addressID: 1, addressType: 'home', contactNumber: 1234567890, addressLine1: '123 St', addressLine2: '', city: 'London', state: 'London', country: 'UK', postalCode: 'E1 1AA', userName: 'Ali', is_default: true },
    ];
    const state = userReducer(undefined, setAddress(addresses));
    expect(state.addresses).toHaveLength(1);
    expect(state.addresses[0].city).toBe('London');
  });

  it('addAddress appends an address', () => {
    const addr = { addressID: 2, addressType: 'work', contactNumber: 1234567890, addressLine1: '456 Ave', addressLine2: '', city: 'Manchester', state: 'Manchester', country: 'UK', postalCode: 'M1 1AA', userName: 'Ali', is_default: false };
    const state = userReducer(undefined, addAddress(addr));
    expect(state.addresses).toHaveLength(1);
    expect(state.addresses[0].addressID).toBe(2);
  });

  it('removeAddress removes by addressID', () => {
    const addr = { addressID: 3, addressType: 'home', contactNumber: 1234567890, addressLine1: '1 Road', addressLine2: '', city: 'Bristol', state: 'Bristol', country: 'UK', postalCode: 'BS1 1AA', userName: 'Ali', is_default: false };
    let state = userReducer(undefined, addAddress(addr));
    state = userReducer(state, removeAddress(3));
    expect(state.addresses).toHaveLength(0);
  });

  it('addCoupon appends a coupon', () => {
    const coupon = { couponid: 1, code: 'SAVE10', description: '10% off', discountpercentage: 10, maxdiscountamount: 50, minpurchaseamount: 100, validuntil: '2027-12-31' };
    const state = userReducer(undefined, addCoupon(coupon));
    expect(state.coupons).toHaveLength(1);
    expect(state.coupons[0].code).toBe('SAVE10');
  });

  it('removeCoupon removes by couponid', () => {
    const coupon = { couponid: 5, code: 'BULK20', description: '20% off', discountpercentage: 20, maxdiscountamount: 100, minpurchaseamount: 200, validuntil: '2027-12-31' };
    let state = userReducer(undefined, addCoupon(coupon));
    state = userReducer(state, removeCoupon(5));
    expect(state.coupons).toHaveLength(0);
  });
});
