import { HexString } from '@gear-js/api';

interface ContractSails {
  programId: HexString,
  idl: string
}

export const ACCOUNT_ID_LOCAL_STORAGE_KEY = 'account';

export const ADDRESS = {
  NODE: import.meta.env.VITE_NODE_ADDRESS,
  BACK: import.meta.env.VITE_BACKEND_ADDRESS,
  GAME: import.meta.env.VITE_CONTRACT_ADDRESS as HexString,
};

export const ROUTES = {
  HOME: '/',
  EXAMPLES: '/examples',
  NOTFOUND: '*',
};

// To use the example code, enter the details of the account that will pay the vouchers, etc. (name and mnemonic)
// Here, you have an example account that contains tokens, in your dApp, you need to put a sponsor name
// and a sponsor mnemonic
export const sponsorName = 'Alice';
export const sponsorMnemonic = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk';

export const CONTRACT_DATA: ContractSails = {
  programId: '0x2e45aa23e42e6ffc7ec9368866d565b367b3cd5cf59b2bb5f7fc35fa27affbfa',
  idl: `
  type Events = enum {
  OrderRegistered,
  PaymentMethodValidated,
  InventoryUpdated,
};

type Errors = enum {
  InvalidPaymentMethod,
  ItemNotAvailable,
  OrderRegistrationFailed,
};

type PaymentMethod = enum {
  VaraToken,
  PayPal,
};

type State = struct {
  admins: vec actor_id,
  all_users: vec struct { actor_id, str },
  register: vec struct { actor_id, CustomStruct },
  orders: vec Order,
  inventory: vec Item,
};

type CustomStruct = struct {
  user: actor_id,
  description: str,
};

type Order = struct {
  item_id: u64,
  user_wallet: actor_id,
  timestamp: u64,
  status: OrderStatus,
  user_country: str,
};

type OrderStatus = enum {
  Pending,
  InProcess,
  Completed,
  Canceled,
};

type Item = struct {
  id: u64,
  size: Size,
  color: Color,
  print: PrintType,
  available: u32,
};

type Size = enum {
  XS,
  S,
  M,
  L,
  XL,
  XXL,
  XXX,
};

type Color = enum {
  Green,
  White,
  Red,
};

type PrintType = enum {
  DTF,
  Serigraphy,
};

constructor {
  New : ();
};

service Service {
  RegisterOrderService : (item_id: u64, user_wallet: actor_id, user_country: str) -> result (Events, Errors);
  UpdateInventoryService : (item_id: u64, quantity: u32) -> result (Events, Errors);
  ValidatePaymentService : (method: PaymentMethod) -> result (Events, Errors);
  query Query : () -> State;
  query QueryAdmins : () -> vec actor_id;
  query QueryAllUsers : () -> vec struct { actor_id, str };
  query QueryOrdersByUser : (user_wallet: actor_id) -> vec Order;
};
  `
};