import logging

import zap.apps.search._typesense as ts

logger = logging.getLogger(__name__)


class WSISearchMixin:

    async def wsi_search_received_message(self):
        try:
            if len(self.message) > 50:
                raise ValueError(f"Message too long: {self.message}")
            await self.send(
                "s" + self.tab_id + ts.typesense_search_documents(self.message)
            )
        except Exception as e:
            logger.error(f"error: wsi_search_received_message: {e}")
            await self.close()
