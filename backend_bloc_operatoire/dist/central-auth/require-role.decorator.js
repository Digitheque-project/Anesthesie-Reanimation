"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireRoleClinique = exports.REQUIRE_ROLE_CLINIQUE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.REQUIRE_ROLE_CLINIQUE_KEY = 'requireRoleClinique';
const RequireRoleClinique = (...roles) => (0, common_1.SetMetadata)(exports.REQUIRE_ROLE_CLINIQUE_KEY, roles);
exports.RequireRoleClinique = RequireRoleClinique;
//# sourceMappingURL=require-role.decorator.js.map