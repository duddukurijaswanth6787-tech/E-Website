export class ExportService {
  /**
   * Convert JSON array to CSV string
   */
  static jsonToCsv(data: any[], headers: string[]) {
    if (!data || data.length === 0) return '';
    
    const headerRow = headers.join(',') + '\n';
    const rows = data.map(item => {
      return headers.map(header => {
        let value = item[header] ?? '';
        // Escape quotes and commas
        if (typeof value === 'string') {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    }).join('\n');

    return headerRow + rows;
  }

  /**
   * Standardize order data for export
   */
  static formatOrdersForExport(orders: any[]) {
    return orders.map(o => ({
      OrderNumber: o.orderNumber,
      Customer: o.user?.name || 'Guest',
      Email: o.user?.email || '',
      Total: o.total,
      Status: o.status,
      PaymentStatus: o.paymentStatus,
      Date: new Date(o.createdAt).toLocaleDateString(),
      ItemsCount: o.items?.length || 0
    }));
  }

  /**
   * Standardize customer data for export
   */
  static formatCustomersForExport(users: any[]) {
    return users.map(u => ({
      Name: u.name,
      Email: u.email,
      Mobile: u.mobile || '',
      JoinedAt: new Date(u.createdAt).toLocaleDateString(),
      OrdersCount: u.orderCount || 0
    }));
  }
}
