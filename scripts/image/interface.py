from pathlib import Path


_IMAGE_PATH: Path = Path(__file__).parent


def get_docker_image_path() -> Path:
    return _IMAGE_PATH
