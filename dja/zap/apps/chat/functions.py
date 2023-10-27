from django.conf import settings


def create_file():
    filepath = settings.TOP_DIR / "tmp_files/"
    size_byte = 1024
    with open(filepath + "myfile.txt", "wb") as f:
        f.write(b"\0" * size_byte)
