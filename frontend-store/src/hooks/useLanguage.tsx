import { useState, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

type Lang = 'zh' | 'en';

let _currentLang: Lang = (localStorage.getItem('lang') as Lang) || 'zh';
export function getCurrentLang(): Lang { return _currentLang; }

const zh: Record<string, string> = {
  // Layout / Nav
  'nav.title': '商店管理',
  'nav.dashboard': '仪表盘',
  'nav.products': '商品管理',
  'nav.orders': '订单管理',
  'nav.profile': '个人中心',
  'nav.logout': '退出登录',

  // Common
  'common.loading': '加载中...',
  'common.error': '操作失败',
  'common.save': '保存',
  'common.cancel': '取消',
  'common.confirm': '确认',
  'common.delete': '删除',
  'common.noImage': '暂无图片',
  'common.noImageShort': '暂无',
  'common.saving': '保存中...',
  'common.submitting': '提交中...',
  'common.processing': '处理中...',

  // Dashboard
  'dashboard.title': '仪表盘',
  'dashboard.loadFailed': '加载统计数据失败',
  'dashboard.totalProducts': '商品总数',
  'dashboard.activeProducts': '在售商品',
  'dashboard.pendingShip': '待发货订单',
  'dashboard.returnPending': '售后中',
  'dashboard.monthlyOrders': '本月订单',
  'dashboard.monthlySales': '本月销售额',

  // Product Management
  'productManage.title': '商品管理',
  'productManage.add': '新增商品',
  'productManage.empty': '暂无商品',
  'productManage.loadFailed': '加载商品失败',
  'productManage.column.product': '商品',
  'productManage.column.price': '价格',
  'productManage.column.stock': '库存',
  'productManage.column.status': '状态',
  'productManage.column.actions': '操作',
  'productManage.edit': '编辑',
  'productManage.list': '上架',
  'productManage.delist': '下架',
  'productManage.active': '上架',
  'productManage.inactive': '下架',

  // Product Form
  'productForm.create': '新增商品',
  'productForm.edit': '编辑商品',
  'productForm.name': '商品名称 *',
  'productForm.summary': '简要描述 *',
  'productForm.description': '详细描述 *',
  'productForm.price': '价格 *',
  'productForm.stock': '库存 *',
  'productForm.category': '分类 *',
  'productForm.selectCategory': '请选择分类',
  'productForm.thumbnail': '缩略图',
  'productForm.detailImage': '详情图',
  'productForm.uploadHint': '点击或拖拽上传缩略图',
  'productForm.uploadHintDetail': '点击或拖拽上传详情图',
  'productForm.fileTypes': '支持 JPG / PNG / WebP / GIF',
  'productForm.removeImage': '移除图片',
  'productForm.preview': '预览',

  // Orders (Admin)
  'adminOrders.title': '订单管理',
  'adminOrders.empty': '暂无订单',
  'adminOrders.loadFailed': '加载订单失败',
  'adminOrders.archived': '已结束的订单',
  'adminOrders.unknownUser': '未知用户',

  // Admin Order Detail
  'adminOrder.title': '订单详情',
  'adminOrder.notFound': '订单不存在',
  'adminOrder.backToList': '返回订单列表',
  'adminOrder.userName': '用户名：',
  'adminOrder.email': '邮箱：',
  'adminOrder.recipient': '收货人：',
  'adminOrder.address': '收货地址：',
  'adminOrder.phone': '联系电话：',
  'adminOrder.shippedAt': '发货时间：',
  'adminOrder.refundedAt': '退款时间：',
  'adminOrder.items': '商品清单',
  'adminOrder.total': '实付金额：',
  'adminOrder.returnReason': '退货原因：',
  'adminOrder.rejectReason': '拒绝原因：',
  'adminOrder.attempts': '已申请 {current}/{max} 次',
  'adminOrder.userReview': '用户评价',
  'adminOrder.confirmShip': '确认发货？',
  'adminOrder.shipBtn': '确认发货',
  'adminOrder.shipping': '发货中...',
  'adminOrder.approveReturn': '同意退货',
  'adminOrder.rejectReturn': '拒绝退货',
  'adminOrder.rejectFormTitle': '拒绝退货',
  'adminOrder.rejectPlaceholder': '拒绝原因（可选）',
  'adminOrder.confirmReject': '确认拒绝',
  'adminOrder.confirmApprove': '确认同意退货并退款？',

  // Order Status
  'status.PAID': '待发货',
  'status.SHIPPED': '已发货',
  'status.COMPLETED': '已完成',
  'status.CANCELLED': '已取消',
  'status.RETURN_PENDING': '售后中',
  'status.REFUNDED': '已退款',

  // Auth / Login
  'auth.title': '商店端登录',
  'auth.subtitle': '管理员账户登录',
  'auth.adminOnly': '该账号无管理员权限，无法登录商店端',
  'auth.loginFailed': '登录失败',
  'auth.email': '邮箱',
  'auth.password': '密码',
  'auth.signingIn': '登录中...',
  'auth.login': '登录',
  'auth.noAccount': '还没有商店账号？',
  'auth.registerNow': '注册商店账号',
  'auth.forgotPassword': '忘记密码？',
  'auth.forgotHint': '输入注册邮箱，密码将重置为 123456',
  'auth.forgotPlaceholder': '请输入邮箱',
  'auth.reset': '重置',

  // Register
  'auth.createAccount': '注册商店账号',
  'auth.registerSubtitle': '创建管理员账户',
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
  'nav.title': 'Store Admin',
  'nav.dashboard': 'Dashboard',
  'nav.products': 'Products',
  'nav.orders': 'Orders',
  'nav.profile': 'Profile',
  'nav.logout': 'Sign Out',

  'common.loading': 'Loading...',
  'common.error': 'Operation failed',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.delete': 'Delete',
  'common.noImage': 'No image',
  'common.noImageShort': 'N/A',
  'common.saving': 'Saving...',
  'common.submitting': 'Submitting...',
  'common.processing': 'Processing...',

  'dashboard.title': 'Dashboard',
  'dashboard.loadFailed': 'Failed to load statistics',
  'dashboard.totalProducts': 'Total Products',
  'dashboard.activeProducts': 'Active Products',
  'dashboard.pendingShip': 'Pending Shipment',
  'dashboard.returnPending': 'Returns Pending',
  'dashboard.monthlyOrders': 'Orders This Month',
  'dashboard.monthlySales': 'Sales This Month',

  'productManage.title': 'Product Management',
  'productManage.add': 'Add Product',
  'productManage.empty': 'No products',
  'productManage.loadFailed': 'Failed to load products',
  'productManage.column.product': 'Product',
  'productManage.column.price': 'Price',
  'productManage.column.stock': 'Stock',
  'productManage.column.status': 'Status',
  'productManage.column.actions': 'Actions',
  'productManage.edit': 'Edit',
  'productManage.list': 'List',
  'productManage.delist': 'Delist',
  'productManage.active': 'Active',
  'productManage.inactive': 'Inactive',

  'productForm.create': 'Add Product',
  'productForm.edit': 'Edit Product',
  'productForm.name': 'Product Name *',
  'productForm.summary': 'Summary *',
  'productForm.description': 'Description *',
  'productForm.price': 'Price *',
  'productForm.stock': 'Stock *',
  'productForm.category': 'Category *',
  'productForm.selectCategory': 'Select category',
  'productForm.thumbnail': 'Thumbnail',
  'productForm.detailImage': 'Detail Image',
  'productForm.uploadHint': 'Click or drag to upload thumbnail',
  'productForm.uploadHintDetail': 'Click or drag to upload detail image',
  'productForm.fileTypes': 'Supports JPG / PNG / WebP / GIF',
  'productForm.removeImage': 'Remove image',
  'productForm.preview': 'Preview',

  'adminOrders.title': 'Order Management',
  'adminOrders.empty': 'No orders',
  'adminOrders.loadFailed': 'Failed to load orders',
  'adminOrders.archived': 'Closed Orders',
  'adminOrders.unknownUser': 'Unknown User',

  'adminOrder.title': 'Order Details',
  'adminOrder.notFound': 'Order not found',
  'adminOrder.backToList': 'Back to Orders',
  'adminOrder.userName': 'Username: ',
  'adminOrder.email': 'Email: ',
  'adminOrder.recipient': 'Recipient: ',
  'adminOrder.address': 'Address: ',
  'adminOrder.phone': 'Phone: ',
  'adminOrder.shippedAt': 'Shipped: ',
  'adminOrder.refundedAt': 'Refunded: ',
  'adminOrder.items': 'Order Items',
  'adminOrder.total': 'Total: ',
  'adminOrder.returnReason': 'Return Reason: ',
  'adminOrder.rejectReason': 'Rejection Reason: ',
  'adminOrder.attempts': 'Attempts: {current}/{max}',
  'adminOrder.userReview': 'Customer Review',
  'adminOrder.confirmShip': 'Confirm shipment?',
  'adminOrder.shipBtn': 'Ship Order',
  'adminOrder.shipping': 'Shipping...',
  'adminOrder.approveReturn': 'Approve Return',
  'adminOrder.rejectReturn': 'Reject Return',
  'adminOrder.rejectFormTitle': 'Reject Return',
  'adminOrder.rejectPlaceholder': 'Rejection reason (optional)',
  'adminOrder.confirmReject': 'Confirm Rejection',
  'adminOrder.confirmApprove': 'Approve return and refund?',

  'status.PAID': 'Awaiting Shipment',
  'status.SHIPPED': 'Shipped',
  'status.COMPLETED': 'Completed',
  'status.CANCELLED': 'Cancelled',
  'status.RETURN_PENDING': 'Return Pending',
  'status.REFUNDED': 'Refunded',

  'auth.title': 'Store Admin Login',
  'auth.subtitle': 'Administrator sign in',
  'auth.adminOnly': 'This account does not have admin privileges',
  'auth.loginFailed': 'Login failed',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signingIn': 'Signing in...',
  'auth.login': 'Sign In',
  'auth.noAccount': "Don't have a store account?",
  'auth.registerNow': 'Register Store Account',
  'auth.forgotPassword': 'Forgot password?',
  'auth.forgotHint': 'Enter your email, password will be reset to 123456',
  'auth.forgotPlaceholder': 'Enter email',
  'auth.reset': 'Reset',

  'auth.createAccount': 'Register Store Account',
  'auth.registerSubtitle': 'Create administrator account',
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
