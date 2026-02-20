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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var pg_1 = require("pg");
// Function to generate random integer within a range
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Function to generate random date within a range
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
// Define constant image URL
var imageUrl = 'https://images.pexels.com/photos/858115/pexels-photo-858115.jpeg';
// Initialize an array to store the data
var data = [];
// Generate 1000 rows of random data
for (var i = 0; i < 1000; i++) {
    var row = {
        ID: i + 1,
        Name: "Person ".concat(i + 1),
        Age: randomInt(18, 70),
        Gender: Math.random() < 0.5 ? 'Male' : 'Female',
        Email: "person".concat(i + 1, "@example.com"),
        Phone_Number: '123-456-7890',
        Address: '123 Main St',
        City: 'City',
        State: 'State',
        Zip_Code: '12345',
        Country: 'Country',
        Occupation: 'Occupation',
        Department: 'Department',
        Salary: Math.random() * 100000,
        Date_of_Hire: randomDate(new Date(2000, 0, 1), new Date()),
        Manager: 'Manager',
        Employee_Type: 'Employee Type',
        Education_Level: 'Education Level',
        Certification: 'Certification',
        Project_Name: "Project ".concat(i + 1),
        Task_Description: 'Task Description',
        Deadline: randomDate(new Date(), new Date(2024, 11, 31)),
        Status: 'Status',
        Priority: 'Priority',
        Image: imageUrl,
        Rating: randomInt(1, 5),
        _row_view456asd6y7da: i + 1,
    };
    data.push(row);
}
// Configure PostgreSQL connection
var pool = new pg_1.Pool({
    user: 'instinct',
    host: 'localhost',
    database: 'sheet',
    password: 'emamiadmin',
    port: 5432,
});
// Function to insert data into database
function insertData() {
    return __awaiter(this, void 0, void 0, function () {
        var client, query, ans, _i, data_1, item, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    query = "\n  SELECT * FROM \"vedant\".\"vedant_new_table\";\n";
                    return [4 /*yield*/, client.query(query)];
                case 2:
                    ans = _a.sent();
                    console.log('ans::---', ans);
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 8, 9, 11]);
                    _i = 0, data_1 = data;
                    _a.label = 4;
                case 4:
                    if (!(_i < data_1.length)) return [3 /*break*/, 7];
                    item = data_1[_i];
                    return [4 /*yield*/, client.query("\n        INSERT INTO vedant.vedant_new_table (ID, Name, Age, Gender, Email, Phone_Number, Address, City, State, Zip_Code, Country, Occupation, Department, Salary, Date_of_Hire, Manager, Employee_Type, Education_Level, Certification, Project_Name, Task_Description, Deadline, Status, Priority, Image, Rating, _row_view456asd6y7da)\n        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)\n      ", [
                            item.ID,
                            item.Name,
                            item.Age,
                            item.Gender,
                            item.Email,
                            item.Phone_Number,
                            item.Address,
                            item.City,
                            item.State,
                            item.Zip_Code,
                            item.Country,
                            item.Occupation,
                            item.Department,
                            item.Salary,
                            item.Date_of_Hire,
                            item.Manager,
                            item.Employee_Type,
                            item.Education_Level,
                            item.Certification,
                            item.Project_Name,
                            item.Task_Description,
                            item.Deadline,
                            item.Status,
                            item.Priority,
                            item.Image,
                            item.Rating,
                            item._row_view456asd6y7da,
                        ])];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    console.log('Data inserted successfully');
                    return [3 /*break*/, 11];
                case 8:
                    error_1 = _a.sent();
                    console.error('Error inserting data:', error_1);
                    return [3 /*break*/, 11];
                case 9:
                    console.log('inside finally');
                    client.release();
                    return [4 /*yield*/, pool.end()];
                case 10:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Call the function to insert data into the database
insertData();
