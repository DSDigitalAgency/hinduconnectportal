"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var mongodb_1 = require("mongodb");
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });
// Get URI and DB name from environment variables
var uri = process.env.MONGODB_URI;
var dbName = process.env.MONGODB_DB_NAME || 'hinduconnect'; // Fallback to 'hinduconnect' if not set
/**
 * Connects to MongoDB, lists all collection names in the specified database,
 * and then closes the connection.
 */
function listCollections() {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, collections, collectionNames, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 1. A check to ensure the URI is actually loaded
                    if (!uri) {
                        throw new Error('The MONGODB_URI environment variable is not set in your .env.local file.');
                    }
                    client = new mongodb_1.MongoClient(uri);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 7]);
                    // Connect to the MongoDB cluster
                    return [4 /*yield*/, client.connect()];
                case 2:
                    // Connect to the MongoDB cluster
                    _a.sent();
                    console.log('✅ Successfully connected to MongoDB!');
                    db = client.db(dbName);
                    return [4 /*yield*/, db.listCollections().toArray()];
                case 3:
                    collections = _a.sent();
                    if (collections.length === 0) {
                        console.log("No collections found in the '".concat(dbName, "' database."));
                        return [2 /*return*/];
                    }
                    collectionNames = collections.map(function (c) { return c.name; });
                    console.log("\nCollections in '".concat(dbName, "':"));
                    console.log(collectionNames);
                    return [3 /*break*/, 7];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ An error occurred:', error_1);
                    return [3 /*break*/, 7];
                case 5: 
                // 2. Ensures that the client will close when you finish/error
                return [4 /*yield*/, client.close()];
                case 6:
                    // 2. Ensures that the client will close when you finish/error
                    _a.sent();
                    console.log('\nConnection to MongoDB closed.');
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Run the function and catch any top-level errors
listCollections().catch(console.error);
