const fs = require('fs');
const filePath = 'src/app/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetForm = 'const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();';
const replacementForm = 'const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();\n  const selectedCity = watch("city");';
if (content.includes(targetForm)) {
    content = content.replace(targetForm, replacementForm);
}

const targetSubmit = 'city: String(data.city || ""),';
const replacementSubmit = 'city: String(data.city === "Other City" ? data.otherCityName : data.city || ""),';
if (content.includes(targetSubmit)) {
    content = content.replace(targetSubmit, replacementSubmit);
}

const targetSelect = `<option value="">Select your city...</option>
                            {PAKISTAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.city && <span className="text-xs text-red-600 font-bold mt-1 block">⚠️ City is required</span>}
                          </div>`;

const replacementSelect = `<option value="">Select your city...</option>
                            {PAKISTAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.city && <span className="text-xs text-red-600 font-bold mt-1 block">⚠️ City is required</span>}
                          </div>

                          {selectedCity === "Other City" && (
                            <div className="mt-4">
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">
                                Enter Your City <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                {...register("otherCityName", { required: "Please enter your city name" })}
                                placeholder="e.g., Mirpur Khas"
                                className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-[#0b2912] focus:ring-2 focus:ring-[#0b2912]/20 transition-all font-medium"
                              />
                              {errors.otherCityName && <span className="text-xs text-red-600 font-bold mt-1 block">⚠️ {String(errors.otherCityName.message)}</span>}
                            </div>
                          )}`;

if (content.includes(targetSelect)) {
    content = content.replace(targetSelect, replacementSelect);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated page.tsx');
