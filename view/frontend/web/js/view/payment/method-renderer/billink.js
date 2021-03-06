/*browser:true*/
/*global define*/
define(
    [
        'jquery',
        'Magento_Checkout/js/view/payment/default',
        'mage/url',
        'Magento_Checkout/js/action/place-order'
    ],
    function ($, Component, url, placeOrderAction) {
        'use strict';
        return Component.extend({
            defaults: {
                template: 'Paynl_Payment/payment/billink'
            },
            kvknummer: null,
            dateofbirth: null,
            billink_agree: null,
            showKVK: function () {
                return this.getKVK() > 0;
            },
            getKVK: function () {
                return window.checkoutConfig.payment.showkvk[this.item.method];
            },
            showDOB: function () {
                return this.getDOB() > 0;
            },
            getDOB: function () {
                return window.checkoutConfig.payment.showdob[this.item.method];
            },
            showKVKDOB: function () {
                return this.getDOB() > 0;
            },
            getKVKDOB: function () {
                return (this.getDOB() > 0 && this.getKVK() > 0);
            },
            /**
             * Get payment method data
             */
            getData: function () {

                var dob = new Date(this.dateofbirth);

                var dd = dob.getDate();
                var mm = dob.getMonth() + 1;

                var yyyy = dob.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }
                var dob_format = dd + '-' + mm + '-' + yyyy;

                return {
                    'method': this.item.method,
                    'po_number': null,
                    'additional_data': {
                        "kvknummer": this.kvknummer,
                        "dob": dob_format,
                        "billink_agree": this.billink_agree
                    }
                };
            },
            getInstructions: function () {
                return window.checkoutConfig.payment.instructions[this.item.method];
            },
            getPaymentIcon: function () {
                return window.checkoutConfig.payment.icon[this.item.method];
            },
            placeOrder: function (data, event) {
                var placeOrder;
                var showingKVK = this.getKVK() == 2;
                var showingDOB = this.getDOB() == 2;
                if (showingKVK) {
                    if (this.billink_agree != true) {
                        alert('U dient eerst akkoord te gaan met de betalingsvoorwaarden van Billink.');
                        return false;
                    }
                    if (this.kvknummer == null || this.kvknummer.length < 8) {
                        alert('Voer een geldig KVK nummer in.');
                        return false;
                    }
                }
                if (showingDOB) {
                    if (this.dateofbirth == null || this.dateofbirth.length < 1) {
                        alert('Voer een geldig geboortedatum in.');
                        return false;
                    }
                }

                if (event) {
                    event.preventDefault();
                }

                $('#billink-button').html('Processing').attr('disabled','disabled');

                this.isPlaceOrderActionAllowed(false);
                placeOrder = placeOrderAction(this.getData(), this.redirectAfterPlaceOrder);

                $.when(placeOrder).fail(function () {
                    this.isPlaceOrderActionAllowed(true);
                }.bind(this)).done(this.afterPlaceOrder.bind(this));

                return true;
            },
            afterPlaceOrder: function () {
                window.location.replace(url.build('/paynl/checkout/redirect?nocache=' + (new Date().getTime())));
            },
        });
    }
);
