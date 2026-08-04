Game.backend = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        mode: "local",
        status: "offline",
        endpoint: "",
        lastSyncAt: 0,
        pendingOperations: [],
        sessionId: null
    };

    function generateSessionId() {
        return "local_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 6);
    }

    instance.initialise = function () {
        this.mode = "local";
        this.status = "offline";
        this.endpoint = "";
        this.lastSyncAt = 0;
        this.pendingOperations = [];
        this.sessionId = generateSessionId();
    };

    instance.save = function (data) {
        data.backend = {
            version: this.dataVersion,
            mode: this.mode,
            status: this.status,
            endpoint: this.endpoint,
            lastSyncAt: this.lastSyncAt,
            pendingOperations: this.pendingOperations.slice(-50),
            sessionId: this.sessionId
        };
    };

    instance.load = function (data) {
        if (!data || !data.backend) return;
        var saved = data.backend;
        this.mode = saved.mode === "remote" ? "remote" : "local";
        this.status = "offline";
        this.endpoint = saved.endpoint || "";
        this.lastSyncAt = Number(saved.lastSyncAt) || 0;
        this.pendingOperations = Array.isArray(saved.pendingOperations) ? saved.pendingOperations.slice(-50) : [];
        this.sessionId = saved.sessionId || generateSessionId();
    };

    instance.queueOperation = function (type, payload) {
        this.pendingOperations.push({
            id: "op_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 4),
            type: type,
            payload: payload || {},
            createdAt: Date.now()
        });
        this.pendingOperations = this.pendingOperations.slice(-50);
    };

    instance.createProfileSnapshot = function () {
        return {
            schema: "mycoverse-profile-v1",
            createdAt: Date.now(),
            account: Game.account ? Game.account.getSummary() : null,
            inventory: Game.inventory ? Game.inventory.getSummary() : null,
            market: {
                historyCount: Game.market && Game.market.history ? Game.market.history.length : 0
            },
            version: typeof versionNumber !== "undefined" ? versionNumber : "MycoVerse"
        };
    };

    instance.exportProfileCode = function () {
        var json = JSON.stringify(this.createProfileSnapshot());
        return LZString && LZString.compressToBase64 ? LZString.compressToBase64(json) : btoa(json);
    };

    instance.simulateLocalSync = function () {
        this.status = "syncing";
        var self = this;
        window.setTimeout(function () {
            self.pendingOperations = [];
            self.lastSyncAt = Date.now();
            self.status = "offline";
            if (Game.notifySuccess) Game.notifySuccess("Local snapshot created", "Profile data was prepared for future cloud synchronization.");
        }, 350);
        return true;
    };

    instance.getStatusLabel = function () {
        if (this.mode === "remote" && this.status === "online") return "Cloud Connected";
        if (this.status === "syncing") return "Preparing Snapshot";
        return "Local Mode";
    };

    return instance;
}());
