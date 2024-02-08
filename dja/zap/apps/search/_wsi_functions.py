import zap.apps.search._typesense as ts


class WSISearchMixin:
    async def wsi_search_received_message(self):
        if len(self.message) > 50:
            await self.close()
        await self.send("s" + self.tab_id + ts.typesense_search_documents(self.message))
