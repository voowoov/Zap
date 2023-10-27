from datetime import datetime
import asyncio
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.cache import cache
from django.utils.translation import get_language
import zap.apps.search.typesense as ts
import zap.apps.chat.functions as ft
import time
import math


class WsiConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        channel_name_abr = "w" + self.channel_name[10:14]
        cache.delete(channel_name_abr)

    async def receive(self, text_data):
        try:
            ##############################################################
            #  the first characters are indicating
            #    -  1st character is the nature of the message
            #      s  : search
            #      c  : chat lobby
            #      d  : chat staff
            #    - 2nd character is the broswer tab id (one char) to be tracked and returned
            #    - [2:]  the rest is the message itself
            ##############################################################
            data_length = len(text_data)
            if data_length >= 2:
                tabId = text_data[1]
                message = text_data[2:]
                match text_data[0]:
                    case "s":
                        if data_length > 52:
                            await self.close()
                        await self.frequency_limiting(10)
                        if message == "":
                            message = "-"
                        # await self.send(
                        #     "s" + tabId + ts.typesense_search_documents(message)
                        # )
                        await self.send("s" + tabId)
                    case "f":
                        await self.frequency_limiting(20)
                        ft.use_message(message)
                        pass
                    case _:
                        pass
            else:
                await self.close()
                pass
        except Exception as e:
            print(e)

    async def frequency_limiting(self, thenthseconds):
        channel_name_abr = "w" + self.channel_name[10:14]
        num = cache.get(
            channel_name_abr, (250 << 16) | (250 << 8) | 0
        )  # stored in 4 bytes in one integer
        # Extract the four bytes
        # byte1 = (num >> 24) & 0xFF
        # score2 = (num >> 16) & 0xFF
        score = (num >> 8) & 0xFF
        timer = num & 0xFF
        # the timer is each 25 seconds with one decimal (0-250) time.time() is epoch time in s
        new_timer = int(time.time() % 25 * 10)  # in 0.1s
        if new_timer < timer:
            diff = 250 - timer + new_timer
        else:
            diff = new_timer - timer
        # score function (in 0.1s) the score is from 0-250
        score = min((score - thenthseconds + diff), 250)
        # print(diff)
        print(score)
        # print(new_timer)
        if score < 0:
            await self.close()
        # num = (byte1 << 24) | (byte2 << 16) | (byte3 << 8) | byte4
        num = (score << 8) | new_timer
        # print(num)
        cache.set(channel_name_abr, num)
