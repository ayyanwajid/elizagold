const fs = require('fs');
const path = 'src/app/admin/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. AdminOrder interface
content = content.replace(
  '  total: number;',
  '  total: number;\n  adminNotes?: string;'
);

// 2. Mutations
content = content.replace(
  'const updateOrderStatusMutation = useMutation(api.orders.updateOrderStatus);',
  'const updateOrderStatusMutation = useMutation(api.orders.updateOrderStatus);\n  const updateOrderDetailsMutation = useMutation(api.orders.updateOrderDetails);\n  const deleteOrderMutation = useMutation(api.orders.deleteOrder);'
);

// 3. State hooks
content = content.replace(
  'const [selectedPrintOrder, setSelectedPrintOrder] = useState<AdminOrder | null>(null);',
  'const [selectedPrintOrder, setSelectedPrintOrder] = useState<AdminOrder | null>(null);\n  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);\n  const [deleteConfirmOrderId, setDeleteConfirmOrderId] = useState<string | null>(null);'
);

// 4. Formatter
content = content.replace(
  'date: o.date, status: o.status',
  'date: o.date, status: o.status, adminNotes: o.adminNotes'
);

// 5. Actions (adding Edit and Delete buttons next to the WhatsApp button)
const actionButtonsTarget = `<button onClick={() => window.open(\`https://wa.me/\${o.customer.phone.replace(/[^0-9]/g, "")}\`, "_blank")} className="bg-emerald-500 text-white p-1.5 rounded hover:bg-emerald-600 transition-colors" title="WhatsApp Customer">
                                      <MessageCircle className="w-4 h-4" />
                                    </button>`;

const newActionButtons = `<button onClick={() => window.open(\`https://wa.me/\${o.customer.phone.replace(/[^0-9]/g, "")}\`, "_blank")} className="bg-emerald-500 text-white p-1.5 rounded hover:bg-emerald-600 transition-colors" title="WhatsApp Customer">
                                      <MessageCircle className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditingOrder(o)} className="bg-blue-500 text-white p-1.5 rounded hover:bg-blue-600 transition-colors" title="Edit Order">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button onClick={() => setDeleteConfirmOrderId(o.orderId)} className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors" title="Delete Order">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>`;
content = content.replace(actionButtonsTarget, newActionButtons);

// 6. Admin Notes display inside the expanded row
const expandedTarget = `<div>
                                      <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Payment</span>
                                      <p className="font-extrabold text-lg text-[#0b2912]">Rs. {o.total?.toLocaleString()}</p>
                                      <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded">Cash On Delivery</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>`;

const newExpandedTarget = `<div>
                                      <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Payment</span>
                                      <p className="font-extrabold text-lg text-[#0b2912]">Rs. {o.total?.toLocaleString()}</p>
                                      <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded">Cash On Delivery</span>
                                    </div>
                                  </div>
                                  {o.adminNotes && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <span className="font-bold text-yellow-800 uppercase text-[10px] flex items-center gap-1 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        Admin Note
                                      </span>
                                      <p className="text-xs text-yellow-900 font-medium whitespace-pre-wrap">{o.adminNotes}</p>
                                    </div>
                                  )}
                                </td>
                              </tr>`;
content = content.replace(expandedTarget, newExpandedTarget);

// 7. Modals at the end of the orders tab
const modalsTarget = `</div>
          )}

          {/*  TAB 3: REVIEWS  */}`;

const newModals = `
              {/* EDIT ORDER MODAL */}
              <AnimatePresence>
                {editingOrder && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
                      <button onClick={() => setEditingOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
                      <h3 className="text-xl font-bold font-serif text-[#0b2912] mb-4">Edit Order {editingOrder.orderId}</h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        if (!adminToken || !editingOrder._id) return;
                        try {
                          await updateOrderDetailsMutation({
                            token: adminToken,
                            id: editingOrder._id as any,
                            customer: {
                              fullName: formData.get("fullName") as string,
                              phone: formData.get("phone") as string,
                              city: formData.get("city") as string,
                              address: formData.get("address") as string,
                            },
                            adminNotes: formData.get("adminNotes") as string,
                          });
                          setEditingOrder(null);
                        } catch (err) { alert("Failed to update order"); }
                      }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                            <input name="fullName" defaultValue={editingOrder.customer.fullName} required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0b2912]" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                            <input name="phone" defaultValue={editingOrder.customer.phone} required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0b2912]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Full Address</label>
                            <input name="address" defaultValue={editingOrder.customer.address} required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0b2912]" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                            <input name="city" defaultValue={editingOrder.customer.city} required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0b2912]" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Internal Admin Note (Optional)</label>
                          <textarea name="adminNotes" defaultValue={editingOrder.adminNotes || ""} placeholder="Add a private note about this order..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0b2912] resize-none h-24" />
                        </div>
                        <div className="pt-4 flex justify-end gap-3 border-t">
                          <button type="button" onClick={() => setEditingOrder(null)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                          <button type="submit" className="bg-[#0b2912] text-white px-5 py-2 text-sm font-bold rounded-lg hover:bg-[#154620]">Save Changes</button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* DELETE CONFIRMATION MODAL */}
              <AnimatePresence>
                {deleteConfirmOrderId && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl relative">
                      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Order?</h3>
                      <p className="text-sm text-gray-500 mb-6">Are you sure you want to permanently delete order <strong>{deleteConfirmOrderId}</strong>? This action cannot be undone.</p>
                      <div className="flex justify-center gap-3">
                        <button onClick={() => setDeleteConfirmOrderId(null)} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
                        <button onClick={async () => {
                          const order = orders.find(o => o.orderId === deleteConfirmOrderId);
                          if (!adminToken || !order?._id) return;
                          try {
                            await deleteOrderMutation({ token: adminToken, id: order._id as any });
                            setDeleteConfirmOrderId(null);
                          } catch (err) { alert("Failed to delete order"); }
                        }} className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl">Yes, Delete</button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/*  TAB 3: REVIEWS  */}`;

content = content.replace(modalsTarget, newModals);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully injected WooCommerce logic');
