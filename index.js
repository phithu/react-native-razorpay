"use strict";

import {
  NativeModules,
  NativeEventEmitter,
  Platform,
} from "react-native";

const razorpayEvents = Platform.OS === "android" ? new NativeEventEmitter(
  NativeModules.RazorpayEventEmitter) : null;

const removeSubscriptions = () => {
  if (Platform.OS === "android") {
    razorpayEvents.removeAllListeners("Razorpay::PAYMENT_SUCCESS");
    razorpayEvents.removeAllListeners("Razorpay::PAYMENT_ERROR");
    razorpayEvents.removeAllListeners("Razorpay::EXTERNAL_WALLET_SELECTED");
  }
};

class RazorpayCheckout {
  static open(options, successCallback, errorCallback) {
    return new Promise(function(resolve, reject) {
      razorpayEvents.addListener("Razorpay::PAYMENT_SUCCESS", (data) => {
        let resolveFn = successCallback || resolve;
        resolveFn(data);
        removeSubscriptions();
      });
      razorpayEvents.addListener("Razorpay::PAYMENT_ERROR", (data) => {
        let rejectFn = errorCallback || reject;
        rejectFn(data);
        removeSubscriptions();
      });
      NativeModules.RazorpayCheckout.open(options);
    });
  }

  static onExternalWalletSelection(externalWalletCallback) {
    razorpayEvents.addListener("Razorpay::EXTERNAL_WALLET_SELECTED", (data) => {
      externalWalletCallback(data);
      removeSubscriptions();
    });
  }
}

export default RazorpayCheckout;
