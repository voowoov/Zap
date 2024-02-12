import json
import logging
import os

logger = logging.getLogger(__name__)

from django.db.models import F
from dotenv import load_dotenv
from zap.apps.search.models import Movie

import typesense

load_dotenv()
client = typesense.Client(
    {
        "nodes": [
            {
                "host": os.getenv("TYPESENSE_HOST"),
                "port": os.getenv("TYPESENSE_PORT"),
                "protocol": "http",
            }
        ],
        "api_key": os.getenv("TYPESENSE_API_KEY"),
        "connection_timeout_seconds": 2,
    }
)


def typesense_create_a_collection():
    # Create a collection
    #
    collection_schema = {
        "name": "products",  # The name of your collection
        "fields": [  # The fields of your documents
            # {"name": "movieid", "type": "int32"},
            {"name": "title", "type": "string"},
            {"name": "language", "type": "string", "facet": False},
            {"name": "release_date", "type": "string", "facet": False},
            {"name": "vote", "type": "float", "facet": False},
        ],
        "default_sorting_field": "vote",  # The field used to sort the results
    }
    client.collections.create(collection_schema)

    return "Collection created"


def typesense_import_documents():
    client_bulk = typesense.Client(
        {
            "nodes": [
                {
                    "host": os.getenv("TYPESENSE_HOST"),
                    "port": os.getenv("TYPESENSE_PORT"),
                    "protocol": "http",
                }
            ],
            "api_key": os.getenv("TYPESENSE_API_KEY"),
            "connection_timeout_seconds": 1,
        }
    )
    # Get all movies and annotate them with a new field movieid
    products = Movie.objects.all()  # .annotate(movieid=F("id"))
    # Open a file in write mode
    with open("products.jsonl", "w") as f:
        # Iterate over the queryset of dictionaries
        for product in products.values("title", "language", "release_date", "vote"):
            # Convert each dictionary into a JSON string
            product_json = json.dumps(product)
            # Write the JSON string to the file with a newline character
            f.write(product_json + "\n")

    # Import the JSON into Typesense
    with open("products.jsonl") as jsonl_file:
        client_bulk.collections["products"].documents.import_(
            jsonl_file.read().encode("utf-8"), {"action": "create"}
        )

    return "Typesense imported documents into collection"


def typesense_test_count_documents():
    collections = client.collections["products"].retrieve()
    # keep this print
    print("number of documents : " + str(collections["num_documents"]))
    search_parameters = {
        "q": "en",
        "query_by": "language",
    }
    documents = client.collections["products"].documents.search(search_parameters)
    # keep this print
    print(documents)
    return "retrieved documents"


def typesense_add_single_document():
    new_product = {
        "title": "New Product",
        "language": "en",
        "release_date": "2023-01-01",
        "vote": 9.9,
    }
    client.collections["products"].documents.create(new_product)
    return "Added single"


def typesense_delete_a_collection():
    # Delete all documents in the products collection
    client.collections["products"].delete()
    return "deleted collection"


import time


def typesense_search_documents(query: str):
    try:
        if query == "":
            query = "-"
        search_parameters = {
            "q": query,  # The search query
            "query_by": "title,language",  # The fields to search by
            "sort_by": "_text_match:desc,vote:desc",  # The sorting order
            "per_page": 10,  # The number of results per page
            "include_fields": "title, vote",  # The fields to include in the results
        }
        results = client.collections["products"].documents.search(search_parameters)
        # A list of dictionaries containing the title and rating of each result
        data = [
            {"title": result["document"]["title"], "vote": result["document"]["vote"]}
            for result in results["hits"]
        ]
        # A JSON string representation of the data
        json_data = json.dumps(data, indent=1)
        return json_data
    except Exception as e:
        logger.error(f"error: typesense_search_documents: {e}")
        return None


###########################################################################################
##          Django database operations
###########################################################################################
from django.core.management import call_command


def movies_fixture_to_db():
    call_command("loaddata", "movies.json")
    return "Added movies to db"


def delete_all_movies_from_db():
    Movie.objects.all().delete()
    # print("deleteddd")
    return "Deleted all movies from db"
