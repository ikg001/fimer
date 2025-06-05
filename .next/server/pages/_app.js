/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./lib/supabaseClient.js":
/*!*******************************!*\
  !*** ./lib/supabaseClient.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"@supabase/supabase-js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__);\n\nif (false) {}\nif (false) {}\nconst supabaseUrl = \"https://kdzmgpqqgahgpidnqxdu.supabase.co\";\nconst supabaseAnonKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkem1ncHFxZ2FoZ3BpZG5xeGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjE1MTgsImV4cCI6MjA2MDk5NzUxOH0.aMeTZApHSXcoFXb7jwYCH__-ZCJqa3yGtFF14I8wB0I\";\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey, {\n    auth: {\n        autoRefreshToken: true,\n        persistSession: true,\n        detectSessionInUrl: true\n    }\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvc3VwYWJhc2VDbGllbnQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQXFEO0FBRXJELElBQUksS0FBcUMsRUFBRSxFQUUxQztBQUVELElBQUksS0FBMEMsRUFBRSxFQUUvQztBQUVELE1BQU1NLGNBQWNMLDBDQUFvQztBQUN4RCxNQUFNTSxrQkFBa0JOLGtOQUF5QztBQUUxRCxNQUFNTyxXQUFXUixtRUFBWUEsQ0FBQ00sYUFBYUMsaUJBQWlCO0lBQ2pFRSxNQUFNO1FBQ0pDLGtCQUFrQjtRQUNsQkMsZ0JBQWdCO1FBQ2hCQyxvQkFBb0I7SUFDdEI7QUFDRixHQUFHIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZmltZXIvLi9saWIvc3VwYWJhc2VDbGllbnQuanM/NWYwZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xyXG5cclxuaWYgKCFwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ05FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCBidWx1bmFtYWTEsScpO1xyXG59XHJcblxyXG5pZiAoIXByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKCdORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSBidWx1bmFtYWTEsScpO1xyXG59XHJcblxyXG5jb25zdCBzdXBhYmFzZVVybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTDtcclxuY29uc3Qgc3VwYWJhc2VBbm9uS2V5ID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVk7XHJcblxyXG5leHBvcnQgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIHN1cGFiYXNlQW5vbktleSwge1xyXG4gIGF1dGg6IHtcclxuICAgIGF1dG9SZWZyZXNoVG9rZW46IHRydWUsXHJcbiAgICBwZXJzaXN0U2Vzc2lvbjogdHJ1ZSxcclxuICAgIGRldGVjdFNlc3Npb25JblVybDogdHJ1ZVxyXG4gIH1cclxufSk7ICJdLCJuYW1lcyI6WyJjcmVhdGVDbGllbnQiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwiRXJyb3IiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsInN1cGFiYXNlVXJsIiwic3VwYWJhc2VBbm9uS2V5Iiwic3VwYWJhc2UiLCJhdXRoIiwiYXV0b1JlZnJlc2hUb2tlbiIsInBlcnNpc3RTZXNzaW9uIiwiZGV0ZWN0U2Vzc2lvbkluVXJsIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./lib/supabaseClient.js\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _supabase_auth_helpers_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @supabase/auth-helpers-react */ \"@supabase/auth-helpers-react\");\n/* harmony import */ var _supabase_auth_helpers_react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_supabase_auth_helpers_react__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/supabaseClient */ \"./lib/supabaseClient.js\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_4__);\n\n\n\n\n\nfunction App({ Component, pageProps }) {\n    const [isSupabaseReady, setIsSupabaseReady] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [supabaseError, setSupabaseError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const checkSupabase = async ()=>{\n            try {\n                // Basit bir health check - daha basit bir sorgu kullanıyoruz\n                await _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_3__.supabase.from(\"profiller\").select(\"id\").limit(1);\n                setIsSupabaseReady(true);\n            } catch (error) {\n                console.error(\"Supabase bağlantı hatası:\", error);\n                setSupabaseError(error.message || \"Supabase bağlantısı sağlanamadı\");\n            }\n        };\n        checkSupabase();\n    }, []);\n    if (supabaseError) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4\",\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"bg-white rounded-lg shadow-lg p-6 max-w-md w-full\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                        className: \"text-red-600 text-xl font-bold mb-4\",\n                        children: \"Bağlantı Hatası\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\devot\\\\Desktop\\\\FİMER\\\\pages\\\\_app.tsx\",\n                        lineNumber: 30,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                        className: \"text-gray-800 mb-4\",\n                        children: \"Supabase'e bağlanırken bir sorun oluştu. L\\xfctfen daha sonra tekrar deneyin.\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\devot\\\\Desktop\\\\FİMER\\\\pages\\\\_app.tsx\",\n                        lineNumber: 31,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"bg-red-50 border-l-4 border-red-400 p-4 mb-4\",\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                            className: \"text-sm text-red-700\",\n                            children: supabaseError\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\devot\\\\Desktop\\\\FİMER\\\\pages\\\\_app.tsx\",\n                            lineNumber: 35,\n                            columnNumber: 13\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\devot\\\\Desktop\\\\FİMER\\\\pages\\\\_app.tsx\",\n                        lineNumber: 34,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                        onClick: ()=>window.location.reload(),\n                        className: \"w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700\",\n                        children: \"Yeniden Dene\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\devot\\\\Desktop\\\\FİMER\\\\pages\\\\_app.tsx\",\n                        lineNumber: 37,\n                        columnNumber: 11\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\devot\\\\Desktop\\\\FİMER\\\\pages\\\\_app.tsx\",\n                lineNumber: 29,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\devot\\\\Desktop\\\\FİMER\\\\pages\\\\_app.tsx\",\n            lineNumber: 28,\n            columnNumber: 7\n        }, this);\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_supabase_auth_helpers_react__WEBPACK_IMPORTED_MODULE_2__.SessionContextProvider, {\n        supabaseClient: _lib_supabaseClient__WEBPACK_IMPORTED_MODULE_3__.supabase,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\devot\\\\Desktop\\\\FİMER\\\\pages\\\\_app.tsx\",\n            lineNumber: 50,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\devot\\\\Desktop\\\\FİMER\\\\pages\\\\_app.tsx\",\n        lineNumber: 49,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUMyQztBQUMwQjtBQUNyQjtBQUNsQjtBQUVmLFNBQVNJLElBQUksRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDNUQsTUFBTSxDQUFDQyxpQkFBaUJDLG1CQUFtQixHQUFHUiwrQ0FBUUEsQ0FBQztJQUN2RCxNQUFNLENBQUNTLGVBQWVDLGlCQUFpQixHQUFHViwrQ0FBUUEsQ0FBZ0I7SUFFbEVDLGdEQUFTQSxDQUFDO1FBQ1IsTUFBTVUsZ0JBQWdCO1lBQ3BCLElBQUk7Z0JBQ0YsNkRBQTZEO2dCQUM3RCxNQUFNUix5REFBUUEsQ0FBQ1MsSUFBSSxDQUFDLGFBQWFDLE1BQU0sQ0FBQyxNQUFNQyxLQUFLLENBQUM7Z0JBQ3BETixtQkFBbUI7WUFDckIsRUFBRSxPQUFPTyxPQUFZO2dCQUNuQkMsUUFBUUQsS0FBSyxDQUFDLDZCQUE2QkE7Z0JBQzNDTCxpQkFBaUJLLE1BQU1FLE9BQU8sSUFBSTtZQUNwQztRQUNGO1FBRUFOO0lBQ0YsR0FBRyxFQUFFO0lBRUwsSUFBSUYsZUFBZTtRQUNqQixxQkFDRSw4REFBQ1M7WUFBSUMsV0FBVTtzQkFDYiw0RUFBQ0Q7Z0JBQUlDLFdBQVU7O2tDQUNiLDhEQUFDQzt3QkFBR0QsV0FBVTtrQ0FBc0M7Ozs7OztrQ0FDcEQsOERBQUNFO3dCQUFFRixXQUFVO2tDQUFxQjs7Ozs7O2tDQUdsQyw4REFBQ0Q7d0JBQUlDLFdBQVU7a0NBQ2IsNEVBQUNFOzRCQUFFRixXQUFVO3NDQUF3QlY7Ozs7Ozs7Ozs7O2tDQUV2Qyw4REFBQ2E7d0JBQ0NDLFNBQVMsSUFBTUMsT0FBT0MsUUFBUSxDQUFDQyxNQUFNO3dCQUNyQ1AsV0FBVTtrQ0FDWDs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFNVDtJQUVBLHFCQUNFLDhEQUFDakIsZ0ZBQXNCQTtRQUFDeUIsZ0JBQWdCeEIseURBQVFBO2tCQUM5Qyw0RUFBQ0U7WUFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7OztBQUc5QiIsInNvdXJjZXMiOlsid2VicGFjazovL2ZpbWVyLy4vcGFnZXMvX2FwcC50c3g/MmZiZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBTZXNzaW9uQ29udGV4dFByb3ZpZGVyIH0gZnJvbSAnQHN1cGFiYXNlL2F1dGgtaGVscGVycy1yZWFjdCdcbmltcG9ydCB7IHN1cGFiYXNlIH0gZnJvbSAnLi4vbGliL3N1cGFiYXNlQ2xpZW50J1xuaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSB7XG4gIGNvbnN0IFtpc1N1cGFiYXNlUmVhZHksIHNldElzU3VwYWJhc2VSZWFkeV0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3N1cGFiYXNlRXJyb3IsIHNldFN1cGFiYXNlRXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGNoZWNrU3VwYWJhc2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBCYXNpdCBiaXIgaGVhbHRoIGNoZWNrIC0gZGFoYSBiYXNpdCBiaXIgc29yZ3Uga3VsbGFuxLF5b3J1elxuICAgICAgICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdwcm9maWxsZXInKS5zZWxlY3QoJ2lkJykubGltaXQoMSlcbiAgICAgICAgc2V0SXNTdXBhYmFzZVJlYWR5KHRydWUpXG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1N1cGFiYXNlIGJhxJ9sYW50xLEgaGF0YXPEsTonLCBlcnJvcilcbiAgICAgICAgc2V0U3VwYWJhc2VFcnJvcihlcnJvci5tZXNzYWdlIHx8ICdTdXBhYmFzZSBiYcSfbGFudMSxc8SxIHNhxJ9sYW5hbWFkxLEnKVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjaGVja1N1cGFiYXNlKClcbiAgfSwgW10pXG5cbiAgaWYgKHN1cGFiYXNlRXJyb3IpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgYmctZ3JheS0xMDAgcC00XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC1sZyBzaGFkb3ctbGcgcC02IG1heC13LW1kIHctZnVsbFwiPlxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ0ZXh0LXJlZC02MDAgdGV4dC14bCBmb250LWJvbGQgbWItNFwiPkJhxJ9sYW50xLEgSGF0YXPEsTwvaDE+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1ncmF5LTgwMCBtYi00XCI+XG4gICAgICAgICAgICBTdXBhYmFzZSdlIGJhxJ9sYW7EsXJrZW4gYmlyIHNvcnVuIG9sdcWfdHUuIEzDvHRmZW4gZGFoYSBzb25yYSB0ZWtyYXIgZGVuZXlpbi5cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1yZWQtNTAgYm9yZGVyLWwtNCBib3JkZXItcmVkLTQwMCBwLTQgbWItNFwiPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LXJlZC03MDBcIj57c3VwYWJhc2VFcnJvcn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBiZy1pbmRpZ28tNjAwIHRleHQtd2hpdGUgcHktMiBweC00IHJvdW5kZWQgaG92ZXI6YmctaW5kaWdvLTcwMFwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgWWVuaWRlbiBEZW5lXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8U2Vzc2lvbkNvbnRleHRQcm92aWRlciBzdXBhYmFzZUNsaWVudD17c3VwYWJhc2V9PlxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgIDwvU2Vzc2lvbkNvbnRleHRQcm92aWRlcj5cbiAgKVxufSJdLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsIlNlc3Npb25Db250ZXh0UHJvdmlkZXIiLCJzdXBhYmFzZSIsIkFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsImlzU3VwYWJhc2VSZWFkeSIsInNldElzU3VwYWJhc2VSZWFkeSIsInN1cGFiYXNlRXJyb3IiLCJzZXRTdXBhYmFzZUVycm9yIiwiY2hlY2tTdXBhYmFzZSIsImZyb20iLCJzZWxlY3QiLCJsaW1pdCIsImVycm9yIiwiY29uc29sZSIsIm1lc3NhZ2UiLCJkaXYiLCJjbGFzc05hbWUiLCJoMSIsInAiLCJidXR0b24iLCJvbkNsaWNrIiwid2luZG93IiwibG9jYXRpb24iLCJyZWxvYWQiLCJzdXBhYmFzZUNsaWVudCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "@supabase/auth-helpers-react":
/*!***********************************************!*\
  !*** external "@supabase/auth-helpers-react" ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@supabase/auth-helpers-react");

/***/ }),

/***/ "@supabase/supabase-js":
/*!****************************************!*\
  !*** external "@supabase/supabase-js" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.tsx"));
module.exports = __webpack_exports__;

})();