"""program_status is memoised only during one notification and never changes results."""

from .helpers import Recorder, local, program, setup, slot


def _two_entities(pid="office"):
    ents = [{"entity_id": f"climate.e{i}", "default_label": "t15", "label_overrides": {}} for i in range(2)]
    return program(pid, [slot("a", "08:00", "12:00", "t21"), slot("b", "14:00", "16:00", "t19")], entities=ents)


async def test_status_identical_with_and_without_shared_occurrences(hass, hass_storage, freezer):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [_two_entities()], local(26, 9, 0))
    plain = {e: engine.next_action(e) for e in ("climate.e0", "climate.e1")}
    shared = engine.program_status("office")["next_actions"]
    assert shared == plain and all(plain.values())


async def test_status_memo_lives_one_notification(hass, hass_storage, freezer):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [_two_entities()], local(26, 9, 0))
    seen = []
    engine.add_listener(lambda: seen.append(engine.program_status("office")))
    engine.add_listener(lambda: seen.append(engine.program_status("office")))
    engine._notify_listeners()  # noqa: SLF001
    assert seen[0] is seen[1]  # computed once inside the notification
    assert engine._status_memo == {}  # noqa: SLF001 - dropped afterwards
    assert engine.program_status("office") is not seen[0]
    assert engine.program_status("office") == seen[0]
