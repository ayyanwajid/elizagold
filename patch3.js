const fs = require('fs');
const path = 'src/app/admin/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const modalsCode = `
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
                            id: editingOrder._id,
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Order?</h3>
                      <p className="text-sm text-gray-500 mb-6">Are you sure you want to permanently delete order <strong>{deleteConfirmOrderId}</strong>? This action cannot be undone.</p>
                      <div className="flex justify-center gap-3">
                        <button onClick={() => setDeleteConfirmOrderId(null)} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
                        <button onClick={async () => {
                          const order = orders.find(o => o.orderId === deleteConfirmOrderId);
                          if (!adminToken || !order?._id) return;
                          try {
                            await deleteOrderMutation({ token: adminToken, id: order._id });
                            setDeleteConfirmOrderId(null);
                          } catch (err) { alert("Failed to delete order"); }
                        }} className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl">Yes, Delete</button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
`;

if (!content.includes('EDIT ORDER MODAL')) {
    content = content.replace(/\{\/\* .* TAB 3: REVIEWS .* \*\/\}/, modalsCode + '\n          $&');
    fs.writeFileSync(path, content, 'utf8');
    console.log('Injected Modals via regex');
} else {
    console.log('Modals already injected');
}

