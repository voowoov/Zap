from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from zap.apps.search.models import Movies


@registry.register_document
class MusicDocument(Document):
    ### fields through foreign keys
    # user = fields.ObjectField(properties={"first_name": fields.TextField(), "email": fields.TextField()})
    # brand = fields.ObjectField(properties={"name": fields.TextField()})

    class Index:
        name = "musics"
        settings = {"number_of_shards": 1, "number_of_replicas": 0}

    class Django:
        model = Movies  # The model associated with this Document

        # The fields of the model you want to be indexed in Elasticsearch
        fields = [
            "language",
            "title",
            "release_date",
            "vote",
        ]

        # Ignore auto updating of Elasticsearch when a model is saved
        # or deleted:
        # ignore_signals = True

        # Don't perform an index refresh after every update (overrides global setting):
        # auto_refresh = False

        # Paginate the django queryset used to populate the index with the specified size
        # (by default it uses the database driver's default setting)
        # queryset_pagination = 5000
