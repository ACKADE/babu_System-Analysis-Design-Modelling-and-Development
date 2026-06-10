import { useState, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

type Lang = 'zh' | 'en';

// Module-level getter for non-React contexts (window.confirm, etc.)
let _currentLang: Lang = (localStorage.getItem('lang') as Lang) || 'zh';
export function getCurrentLang(): Lang { return _currentLang; }

const zh: Record<string, string> = {
  // Layout / Nav
  'nav.title': '简易商城',
  'nav.products': '商品',
  'nav.cart': '购物车',
  'nav.myOrders': '我的订单',
  'nav.profile': '个人中心',
  'nav.logout': '退出登录',
  'nav.login': '登录',
  'footer.copyright': '简易商城',

  // Common
  'common.loading': '加载中...',
  'common.error': '操作失败',
  'common.save': '保存',
  'common.cancel': '取消',
  'common.confirm': '确认',
  'common.delete': '删除',
  'common.noImage': '暂无图片',
  'common.noImageShort': '暂无',
  'common.anonymous': '匿名',
  'common.back': '返回',

  // Product List
  'product.allProducts': '全部商品',
  'product.filter': '筛选',
  'product.collapse': '收起',
  'product.itemsCount': '{count} 件商品',
  'product.loadFailed': '加载商品失败，请稍后重试',
  'product.noProducts': '暂无商品',
  'product.browseShop': '去逛逛',

  // Product Detail
  'product.notFound': '商品不存在',
  'product.backToList': '返回商品列表',
  'product.stockCount': '库存 {count} 件',
  'product.outOfStock': '暂时缺货',
  'product.addToCart': '加入购物车',
  'product.insufficientStock': '库存不足',
  'product.adding': '添加中...',
  'product.loginToBuy': '登录后购买',
  'product.addedToCart': '已添加 {count} 件到购物车',
  'product.addToCartFailed': '添加到购物车失败',
  'product.description': '商品描述',
  'product.reviews': '商品评价',
  'product.reviewCount': '({count})',

  // Cart
  'cart.title': '购物车',
  'cart.empty': '购物车是空的',
  'cart.loadFailed': '加载购物车失败',
  'cart.delisted': '已下架',
  'cart.confirmRemove': '确认要删除此商品吗？',
  'cart.itemCount': '共 {count} 件商品',
  'cart.checkout': '去结算',
  'cart.noCheckoutItems': '购物车中无可结算商品',

  // Checkout
  'checkout.title': '确认订单',
  'checkout.shippingInfo': '收货信息',
  'checkout.recipientName': '收货人',
  'checkout.recipientAddress': '收货地址',
  'checkout.recipientPhone': '联系电话',
  'checkout.phoneHint': '7-15位数字',
  'checkout.itemsList': '商品清单',
  'checkout.total': '合计',
  'checkout.submitFailed': '提交订单失败',
  'checkout.submitting': '提交中...',
  'checkout.placeOrder': '提交订单并支付',

  // Payment Success
  'payment.title': '支付成功',
  'payment.message': '您的订单已提交，我们将尽快为您发货',
  'payment.orderNo': '订单号',
  'payment.recipient': '收货人',
  'payment.address': '收货地址',
  'payment.phone': '联系电话',
  'payment.totalPaid': '实付金额',
  'payment.viewOrder': '查看订单详情',
  'payment.continueShopping': '继续购物',

  // Orders
  'orders.title': '我的订单',
  'orders.empty': '暂无订单',
  'orders.loadFailed': '加载订单失败',
  'orders.itemsAndTotal': '共 {count} 件，实付 ',
  'orders.backToList': '返回订单列表',

  // Order Detail
  'order.title': '订单详情',
  'order.notFound': '订单不存在或无权查看',
  'order.backToOrders': '返回我的订单',
  'order.recipientLabel': '收货人：',
  'order.addressLabel': '收货地址：',
  'order.phoneLabel': '联系电话：',
  'order.itemsLabel': '商品清单',
  'order.totalLabel': '实付金额：',
  'order.returnReason': '退货原因：',
  'order.rejectReason': '拒绝原因：',
  'order.returnAttempts': '已申请 {current}/{max} 次',
  'order.confirmCancel': '确认要取消此订单吗？',
  'order.cancelOrder': '取消订单',
  'order.cancelling': '取消中...',
  'order.confirmReceipt': '确认已收到货物吗？',
  'order.confirmReceiptBtn': '确认收货',
  'order.confirming': '确认中...',
  'order.requestReturn': '申请售后',
  'order.returnFormTitle': '申请退货',
  'order.returnPlaceholder': '请描述退货原因（至少5个字）',
  'order.submitRequest': '提交申请',
  'order.submitting': '提交中...',
  'order.requestFailed': '申请失败',
  'order.reviewProduct': '评价商品',
  'order.reviewFormTitle': '评价商品',
  'order.reviewProductLabel': '商品',
  'order.reviewRating': '评分',
  'order.reviewContent': '评价内容（可选）',
  'order.submitReview': '提交评价',
  'order.reviewFailed': '评价失败',
  'order.myReview': '我的评价',

  // Order Status
  'status.PAID': '待发货',
  'status.SHIPPED': '已发货',
  'status.COMPLETED': '已完成',
  'status.CANCELLED': '已取消',
  'status.RETURN_PENDING': '售后中',
  'status.REFUNDED': '已退款',

  // Auth / Login
  'auth.welcomeBack': '欢迎回来',
  'auth.loginSubtitle': '登录您的账户以继续购物',
  'auth.loginFailed': '登录失败',
  'auth.email': '邮箱',
  'auth.password': '密码',
  'auth.signingIn': '登录中...',
  'auth.login': '登录',
  'auth.noAccount': '还没有账号？',
  'auth.registerNow': '立即注册',
  'auth.forgotPassword': '忘记密码？',
  'auth.forgotHint': '输入注册邮箱，密码将重置为 123456',
  'auth.forgotPlaceholder': '请输入邮箱',
  'auth.reset': '重置',

  // Register
  'auth.createAccount': '创建账户',
  'auth.registerSubtitle': '注册即可开始购物',
  'auth.registerFailed': '注册失败',
  'auth.username': '用户名',
  'auth.registering': '注册中...',
  'auth.register': '注册',
  'auth.hasAccount': '已有账号？',
  'auth.loginNow': '立即登录',

  // Profile
  'profile.title': '个人中心',
  'profile.basicInfo': '基本信息',
  'profile.emailLabel': '邮箱：',
  'profile.roleLabel': '角色：',
  'profile.changeName': '修改用户名',
  'profile.changePassword': '修改密码',
  'profile.oldPassword': '旧密码',
  'profile.newPassword': '新密码（至少6位）',
  'profile.passwordBtn': '修改密码',
  'profile.updateSuccess': '修改成功',
  'profile.updateFailed': '修改失败',
};

const en: Record<string, string> = {
  'nav.title': 'Simple Shop',
  'nav.products': 'Products',
  'nav.cart': 'Cart',
  'nav.myOrders': 'My Orders',
  'nav.profile': 'Profile',
  'nav.logout': 'Sign Out',
  'nav.login': 'Sign In',
  'footer.copyright': 'Simple Shop',

  'common.loading': 'Loading...',
  'common.error': 'Operation failed',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.delete': 'Delete',
  'common.noImage': 'No image',
  'common.noImageShort': 'N/A',
  'common.anonymous': 'Anonymous',
  'common.back': 'Back',

  'product.allProducts': 'All Products',
  'product.filter': 'Filter',
  'product.collapse': 'Collapse',
  'product.itemsCount': '{count} items',
  'product.loadFailed': 'Failed to load products, please try again',
  'product.noProducts': 'No products available',
  'product.browseShop': 'Browse Products',

  'product.notFound': 'Product not found',
  'product.backToList': 'Back to products',
  'product.stockCount': '{count} in stock',
  'product.outOfStock': 'Out of stock',
  'product.addToCart': 'Add to Cart',
  'product.insufficientStock': 'Insufficient stock',
  'product.adding': 'Adding...',
  'product.loginToBuy': 'Sign in to buy',
  'product.addedToCart': 'Added {count} to cart',
  'product.addToCartFailed': 'Failed to add to cart',
  'product.description': 'Description',
  'product.reviews': 'Reviews',
  'product.reviewCount': '({count})',

  'cart.title': 'Cart',
  'cart.empty': 'Your cart is empty',
  'cart.loadFailed': 'Failed to load cart',
  'cart.delisted': 'Delisted',
  'cart.confirmRemove': 'Remove this item from cart?',
  'cart.itemCount': '{count} items',
  'cart.checkout': 'Checkout',
  'cart.noCheckoutItems': 'No items available for checkout',

  'checkout.title': 'Confirm Order',
  'checkout.shippingInfo': 'Shipping Information',
  'checkout.recipientName': 'Recipient',
  'checkout.recipientAddress': 'Address',
  'checkout.recipientPhone': 'Phone',
  'checkout.phoneHint': '7-15 digits',
  'checkout.itemsList': 'Order Items',
  'checkout.total': 'Total',
  'checkout.submitFailed': 'Failed to submit order',
  'checkout.submitting': 'Submitting...',
  'checkout.placeOrder': 'Place Order',

  'payment.title': 'Payment Successful',
  'payment.message': 'Your order has been placed. We will ship it soon.',
  'payment.orderNo': 'Order No.',
  'payment.recipient': 'Recipient',
  'payment.address': 'Address',
  'payment.phone': 'Phone',
  'payment.totalPaid': 'Total Paid',
  'payment.viewOrder': 'View Order Details',
  'payment.continueShopping': 'Continue Shopping',

  'orders.title': 'My Orders',
  'orders.empty': 'No orders',
  'orders.loadFailed': 'Failed to load orders',
  'orders.itemsAndTotal': '{count} items, paid ',
  'orders.backToList': 'Back to Orders',

  'order.title': 'Order Details',
  'order.notFound': 'Order not found or unauthorized',
  'order.backToOrders': 'Back to My Orders',
  'order.recipientLabel': 'Recipient: ',
  'order.addressLabel': 'Address: ',
  'order.phoneLabel': 'Phone: ',
  'order.itemsLabel': 'Order Items',
  'order.totalLabel': 'Total Paid: ',
  'order.returnReason': 'Return Reason: ',
  'order.rejectReason': 'Rejection Reason: ',
  'order.returnAttempts': 'Applied {current}/{max} times',
  'order.confirmCancel': 'Cancel this order?',
  'order.cancelOrder': 'Cancel Order',
  'order.cancelling': 'Cancelling...',
  'order.confirmReceipt': 'Confirm you have received the goods?',
  'order.confirmReceiptBtn': 'Confirm Receipt',
  'order.confirming': 'Confirming...',
  'order.requestReturn': 'Request Return',
  'order.returnFormTitle': 'Return Request',
  'order.returnPlaceholder': 'Describe the reason for return (min 5 characters)',
  'order.submitRequest': 'Submit Request',
  'order.submitting': 'Submitting...',
  'order.requestFailed': 'Request failed',
  'order.reviewProduct': 'Write Review',
  'order.reviewFormTitle': 'Write Review',
  'order.reviewProductLabel': 'Product',
  'order.reviewRating': 'Rating',
  'order.reviewContent': 'Review (optional)',
  'order.submitReview': 'Submit Review',
  'order.reviewFailed': 'Review failed',
  'order.myReview': 'My Review',

  'status.PAID': 'Awaiting Shipment',
  'status.SHIPPED': 'Shipped',
  'status.COMPLETED': 'Completed',
  'status.CANCELLED': 'Cancelled',
  'status.RETURN_PENDING': 'Return Pending',
  'status.REFUNDED': 'Refunded',

  'auth.welcomeBack': 'Welcome Back',
  'auth.loginSubtitle': 'Sign in to continue shopping',
  'auth.loginFailed': 'Login failed',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signingIn': 'Signing in...',
  'auth.login': 'Sign In',
  'auth.noAccount': "Don't have an account?",
  'auth.registerNow': 'Register',
  'auth.forgotPassword': 'Forgot password?',
  'auth.forgotHint': 'Enter your email, password will be reset to 123456',
  'auth.forgotPlaceholder': 'Enter email',
  'auth.reset': 'Reset',

  'auth.createAccount': 'Create Account',
  'auth.registerSubtitle': 'Register to start shopping',
  'auth.registerFailed': 'Registration failed',
  'auth.username': 'Username',
  'auth.registering': 'Registering...',
  'auth.register': 'Register',
  'auth.hasAccount': 'Already have an account?',
  'auth.loginNow': 'Sign In',

  'profile.title': 'Profile',
  'profile.basicInfo': 'Basic Information',
  'profile.emailLabel': 'Email: ',
  'profile.roleLabel': 'Role: ',
  'profile.changeName': 'Change Username',
  'profile.changePassword': 'Change Password',
  'profile.oldPassword': 'Old Password',
  'profile.newPassword': 'New Password (min 6 chars)',
  'profile.passwordBtn': 'Change Password',
  'profile.updateSuccess': 'Updated successfully',
  'profile.updateFailed': 'Update failed',
};

const translations: Record<Lang, Record<string, string>> = { zh, en };

interface LanguageContextValue {
  lang: Lang;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'zh') return stored;
  } catch { /* localStorage unavailable */ }
  return 'zh';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    _currentLang = newLang;
    try { localStorage.setItem('lang', newLang); } catch { /* ignore */ }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let text = translations[lang][key] ?? translations.zh[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>');
  return ctx;
}
