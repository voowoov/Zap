To limit the size of websocket messages, protocol.py of autobahn is bindmount with this one
The following lines were changed in protocol.py

        self.maxFramePayloadSize = 2001
        self.maxMessagePayloadSize = 2001
        self.maxFramePayloadSize = 2001
        self.maxMessagePayloadSize = 2001

The size is in bytes.