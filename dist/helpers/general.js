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
Object.defineProperty(exports, "__esModule", { value: true });
let GeneralHelper = {
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    randomItemInArray(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return null;
        }
        if (array.length === 1) {
            return array[0];
        }
        return array[GeneralHelper.randomNumber(0, array.length - 1)];
    },
    sleep(time) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(resolve, time));
        });
    },
    now() {
        return Math.floor(Date.now() / 1000);
    },
    newExpiryTime(howManyMin = 5) {
        return GeneralHelper.now() + howManyMin * 60;
    },
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
};
exports.default = GeneralHelper;
