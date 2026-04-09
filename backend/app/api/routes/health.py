from fastapi import APIRouter

# TODO: remember to check real DB connection in /health/ready

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.get("/health/live")
def health_live():
    return {"status": "live"}


@router.get("/health/ready")
def health_ready():
    # TODO: remember to return DB status here
    return {"status": "ready", "checks": {"api": "ok"}}