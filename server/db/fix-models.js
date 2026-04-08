const fs = require('fs');
const path = require('path');
const modelsDir = path.join(__dirname, '..', 'models');

const files = {
  'Admin.js': "// Local JSON store model\nconst { Admin } = require('../db/models');\nmodule.exports = Admin;\n",
  'User.js': "// Local JSON store model\nconst { User } = require('../db/models');\nmodule.exports = User;\n",
  'Product.js': "// Local JSON store model\nconst { Product } = require('../db/models');\nmodule.exports = Product;\n",
  'Order.js': "// Local JSON store model\nconst { Order } = require('../db/models');\nmodule.exports = Order;\n",
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(modelsDir, name), content, 'utf8');
  console.log('Written: ' + name);
}
console.log('All model files fixed!');
