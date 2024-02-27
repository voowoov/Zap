import logging

import zap.apps.search._typesense as ts

logger = logging.getLogger(__name__)


class WsiSearchMixin:

    async def wsi_search_received_message(self, message):
        try:
            if len(message) > 52:
                raise ValueError(f"Message too long: {message}")
            await self.send(
                "s" + message[1] + ts.typesense_search_documents(message[2:])
            )
        except Exception as e:
            logger.error(f"error: wsi_search_received_message: {e}")
            await self.close()
