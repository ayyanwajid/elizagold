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

// For the select block, let's use a regex to capture it.
// We want to insert the input block AFTER `</div>` that closes the city select field.
// Let's find: `name="address"` and go backwards... No, let's find `Full Delivery Street Address` and insert before it.

const injectionPoint = '                        <div>\n                          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">\n                            Full Delivery Street Address';

const injectionContent = `
                        {selectedCity === "Other City" && (
                          <div className="mb-4">
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
                        )}
` + injectionPoint;

if (content.includes(injectionPoint)) {
    // Check if we haven't already injected it
    if (!content.includes('Enter Your City')) {
        content = content.replace(injectionPoint, injectionContent);
    }
} else {
    console.log('Could not find injection point');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated page.tsx');
